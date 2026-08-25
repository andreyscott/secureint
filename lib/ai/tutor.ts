import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db/prisma";
import {
  TUTOR_SYSTEM_PROMPT,
  buildTutorContextPrompt,
} from "./prompts";

// Initialize Gemini client - server-side only
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

export interface TutorChatParams {
  userId: string;
  attemptId: string;
  userMessage: string;
  missionSlug: string;
}

export async function runSocraticTutor(params: TutorChatParams): Promise<string> {
  const { userId, attemptId, userMessage } = params;

  // Load context server-side
  const [attempt, userSkills, recentMessages] = await Promise.all([
    prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mission: {
          include: { evidence: { orderBy: { order: "asc" } } },
        },
        actions: {
          orderBy: { createdAt: "desc" },
          take: 15,
        },
      },
    }),
    prisma.learnerSkill.findMany({
      where: { userId },
    }),
    prisma.aIMessage.findMany({
      where: { attemptId },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ]);

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.userId !== userId) throw new Error("Unauthorized");

  // Build context prompt
  const contextPrompt = buildTutorContextPrompt({
    missionTitle: attempt.mission.title,
    missionBriefing: attempt.mission.briefing,
    availableEvidence: attempt.mission.evidence.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
    })),
    recentActions: [...attempt.actions].reverse().map((a) => ({
      action: a.action,
      targetId: a.targetId,
      createdAt: a.createdAt,
    })),
    learnerSkills: userSkills.map((s) => ({
      skill: s.skill,
      mastery: s.mastery,
    })),
  });

  // Build conversation history
  const conversationHistory = recentMessages.map((msg) => ({
    role: msg.role === "USER" ? "user" as const : "model" as const,
    parts: [{ text: msg.content }],
  }));

  const genAI = getGeminiClient();

  // Add context to system prompt
  const fullSystemPrompt = `${TUTOR_SYSTEM_PROMPT}\n\n${contextPrompt}`;

  let assistantMessage: string;

  try {
    const contents = [
      ...conversationHistory,
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: fullSystemPrompt,
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    assistantMessage =
      response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm having trouble processing that. Could you rephrase your question?";
  } catch (error) {
    console.error("Tutor AI error:", error);
    assistantMessage =
      "I'm experiencing technical difficulties. Please try again in a moment.";
  }

  // Persist both messages
  await prisma.aIMessage.createMany({
    data: [
      {
        userId,
        attemptId,
        role: "USER",
        content: userMessage,
      },
      {
        userId,
        attemptId,
        role: "ASSISTANT",
        content: assistantMessage,
      },
    ],
  });

  // Record the ASK_AI action
  await prisma.investigationAction.create({
    data: {
      attemptId,
      action: "ASK_AI",
      metadata: { messageLength: userMessage.length },
    },
  });

  return assistantMessage;
}
