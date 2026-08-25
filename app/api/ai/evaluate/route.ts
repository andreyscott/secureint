import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/helpers";
import { runEvaluator } from "@/lib/ai/evaluator";
import { updateLearnerSkills } from "@/lib/ai/recommender";
import { missionSubmissionSchema } from "@/lib/ai/schemas";
import { evaluateAnswers, getInvestigationSummary } from "@/lib/mission/engine";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser();

    const body = await req.json();
    const parsed = missionSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { attemptId, answers, finalReasoning, attackVector, recommendedResponse } = parsed.data;

    // Verify attempt belongs to user and is in progress
    const attempt = await prisma.missionAttempt.findUnique({
      where: { id: attemptId, userId: user.id, status: "IN_PROGRESS" },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found or already completed" },
        { status: 404 }
      );
    }

    // Evaluate answers server-side (deterministic)
    await evaluateAnswers(
      attemptId,
      answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer as string,
        reasoning: a.reasoning,
      }))
    );

    // Run AI evaluator
    const evaluation = await runEvaluator({
      attemptId,
      finalReasoning,
      attackVector,
      recommendedResponse,
    });

    // Update learner skills
    const summary = await getInvestigationSummary(attemptId);
    await updateLearnerSkills(user.id, evaluation.skills, {
      hasMisconceptions: evaluation.misconceptions.length > 0,
      aiQuestionsAsked: summary.aiQuestionsAsked,
      totalActions: summary.attempt.actions.length,
    });

    return NextResponse.json({
      success: true,
      evaluation,
      redirectTo: `/missions/${attempt.missionId}/results?attempt=${attemptId}`,
    });
  } catch (error) {
    console.error("Evaluation API error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to evaluate submission" },
      { status: 500 }
    );
  }
}
