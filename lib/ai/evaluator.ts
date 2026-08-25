import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db/prisma";
import { buildEvaluatorPrompt, EVALUATOR_SYSTEM_PROMPT } from "./prompts";
import { aiEvaluationSchema, type AIEvaluationResult } from "./schemas";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

export interface EvaluatorParams {
  attemptId: string;
  finalReasoning: string;
  attackVector: string;
  recommendedResponse: string;
}

export async function runEvaluator(
  params: EvaluatorParams
): Promise<AIEvaluationResult> {
  const { attemptId, finalReasoning, attackVector, recommendedResponse } = params;

  // Load full attempt context
  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mission: {
        include: {
          evidence: { orderBy: { order: "asc" } },
          questions: { include: { answers: { where: { attemptId } } } },
          objectives: true,
          skills: true,
        },
      },
      actions: { orderBy: { createdAt: "asc" } },
      answers: {
        include: { question: true },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");

  // Determine what evidence was viewed
  const viewedEvidenceIds = attempt.actions
    .filter((a) => a.action === "VIEW_EVIDENCE" && a.targetId)
    .map((a) => a.targetId as string);

  const allEvidenceTitles = attempt.mission.evidence.map(
    (e) => `[${e.type}] ${e.title}`
  );
  const viewedEvidenceTitles = attempt.mission.evidence
    .filter((e) => viewedEvidenceIds.includes(e.id))
    .map((e) => `[${e.type}] ${e.title}`);

  // Build Q&A pairs
  const questionsAndAnswers = attempt.answers.map((ans) => ({
    question: ans.question.question,
    correctAnswer: JSON.stringify(ans.question.correctData),
    learnerAnswer: JSON.stringify(ans.answer),
    reasoning: ans.reasoning ?? undefined,
  }));

  // Build the evaluation prompt
  const evaluatorPrompt = buildEvaluatorPrompt({
    missionTitle: attempt.mission.title,
    missionBriefing: attempt.mission.briefing,
    expectedChain:
      "Phishing email → credential harvesting site → compromised credentials → suspicious authentication → account compromise → incident response",
    keyEvidence: attempt.mission.evidence
      .filter((e) => e.isKey)
      .map((e) => `[${e.type}] ${e.title}`),
    questionsAndAnswers,
    actionsTimeline: attempt.actions.map((a) => ({
      action: a.action,
      targetId: a.targetId,
      metadata: a.metadata as Record<string, unknown> | null,
      createdAt: a.createdAt,
    })),
    finalReasoning,
    attackVector,
    recommendedResponse,
    evidenceViewed: viewedEvidenceTitles,
    allEvidence: allEvidenceTitles,
  });

  const genAI = getGeminiClient();

  let rawResponse: string;
  let evaluation: AIEvaluationResult;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: evaluatorPrompt }] }],
      config: {
        systemInstruction: EVALUATOR_SYSTEM_PROMPT,
        maxOutputTokens: 2048,
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    rawResponse =
      response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Parse and validate with Zod
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    evaluation = aiEvaluationSchema.parse(parsed);
  } catch (error) {
    console.error("Evaluator AI error:", error);
    // Fallback evaluation
    evaluation = {
      overallScore: 50,
      investigationScore: 50,
      reasoningScore: 50,
      knowledgeScore: 50,
      summary:
        "Evaluation could not be completed. Please review your investigation manually.",
      strengths: ["Completed the investigation"],
      weaknesses: ["AI evaluation temporarily unavailable"],
      misconceptions: [],
      recommendations: ["Review phishing attack patterns", "Study credential compromise indicators"],
      skills: attempt.mission.skills.map((s) => ({
        name: s.skill,
        masteryDelta: 0,
      })),
      nextMissionSkills: ["phishing", "authentication"],
    };
    rawResponse = "{}";
  }

  // Persist evaluation to database
  await prisma.aIEvaluation.create({
    data: {
      attemptId,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      misconceptions: evaluation.misconceptions,
      recommendations: evaluation.recommendations,
      investigationScore: evaluation.investigationScore,
      reasoningScore: evaluation.reasoningScore,
      knowledgeScore: evaluation.knowledgeScore,
      overallScore: evaluation.overallScore,
      skillDeltas: evaluation.skills,
      nextMissionSkills: evaluation.nextMissionSkills,
      rawResponse: { raw: rawResponse },
    },
  });

  // Update attempt scores
  await prisma.missionAttempt.update({
    where: { id: attemptId },
    data: {
      score: evaluation.overallScore,
      investigationScore: evaluation.investigationScore,
      reasoningScore: evaluation.reasoningScore,
      accuracyScore: evaluation.knowledgeScore,
      completedAt: new Date(),
      status: "COMPLETED",
    },
  });

  return evaluation;
}
