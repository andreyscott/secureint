import { prisma } from "@/lib/db/prisma";
import type { ActionType } from "@/app/generated/prisma";

// ============================================================
// MISSION ENGINE — Server-side mission business logic
// Never trust client; all state computed server-side
// ============================================================

export interface MissionContext {
  missionId: string;
  userId: string;
  attemptId: string;
}

/**
 * Start a new mission attempt or return existing in-progress attempt.
 */
export async function startOrResumeAttempt(
  userId: string,
  missionSlug: string
): Promise<{ attemptId: string; isNew: boolean }> {
  const mission = await prisma.mission.findUnique({
    where: { slug: missionSlug, status: "PUBLISHED" },
  });

  if (!mission) throw new Error(`Mission not found: ${missionSlug}`);

  // Check for existing in-progress attempt
  const existing = await prisma.missionAttempt.findFirst({
    where: {
      userId,
      missionId: mission.id,
      status: "IN_PROGRESS",
    },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    return { attemptId: existing.id, isNew: false };
  }

  // Create new attempt
  const attempt = await prisma.missionAttempt.create({
    data: {
      userId,
      missionId: mission.id,
      status: "IN_PROGRESS",
    },
  });

  return { attemptId: attempt.id, isNew: true };
}

/**
 * Record an investigation action. Server-side only.
 */
export async function recordAction(
  userId: string,
  attemptId: string,
  action: ActionType,
  targetId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Verify the attempt belongs to this user
  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    select: { id: true },
  });

  if (!attempt) throw new Error("Attempt not found or not authorized");

  await prisma.investigationAction.create({
    data: {
      attemptId,
      action,
      targetId: targetId ?? null,
      metadata: metadata as object ?? undefined,
    },
  });
}

/**
 * Get full mission data with evidence for investigation workspace.
 * Returns mission with evidence visible to the learner.
 */
export async function getMissionForInvestigation(missionSlug: string) {
  return prisma.mission.findUnique({
    where: { slug: missionSlug, status: "PUBLISHED" },
    include: {
      evidence: { orderBy: { order: "asc" } },
      questions: { orderBy: { order: "asc" } },
      objectives: { orderBy: { order: "asc" } },
      skills: true,
    },
  });
}

/**
 * Get attempt with full action history.
 */
export async function getAttemptWithActions(
  attemptId: string,
  userId: string
) {
  return prisma.missionAttempt.findUnique({
    where: { id: attemptId, userId },
    include: {
      actions: { orderBy: { createdAt: "asc" } },
      answers: { include: { question: true } },
      aiMessages: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Server-side deterministic scoring for answers.
 * Never trust client-reported correctness.
 */
export async function evaluateAnswers(
  attemptId: string,
  answers: Array<{
    questionId: string;
    answer: string | string[] | Record<string, unknown>;
    reasoning?: string;
  }>
): Promise<Array<{ questionId: string; isCorrect: boolean }>> {
  const questions = await prisma.missionQuestion.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
  });

  const results: Array<{ questionId: string; isCorrect: boolean }> = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const correctData = question.correctData as { answer: string };
    let isCorrect = false;

    // Simple string comparison for multiple choice
    if (question.type === "MULTIPLE_CHOICE") {
      const learnerAnswer =
        typeof answer.answer === "string"
          ? answer.answer
          : JSON.stringify(answer.answer);
      isCorrect =
        learnerAnswer.trim().toLowerCase() ===
        correctData.answer.trim().toLowerCase();
    }

    // Persist the answer
    await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: answer.questionId,
        },
      },
      update: {
        answer: answer.answer as string,
        isCorrect,
        reasoning: answer.reasoning,
      },
      create: {
        attemptId,
        questionId: answer.questionId,
        answer: answer.answer as string,
        isCorrect,
        reasoning: answer.reasoning,
      },
    });

    results.push({ questionId: answer.questionId, isCorrect });
  }

  return results;
}

/**
 * Get investigation summary for evaluator.
 */
export async function getInvestigationSummary(attemptId: string) {
  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId },
    include: {
      actions: { orderBy: { createdAt: "asc" } },
      answers: { include: { question: true } },
      mission: {
        include: {
          evidence: true,
          questions: true,
          skills: true,
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");

  const aiQuestionsAsked = attempt.actions.filter(
    (a) => a.action === "ASK_AI"
  ).length;

  const evidenceViewed = [
    ...new Set(
      attempt.actions
        .filter((a) => a.action === "VIEW_EVIDENCE" && a.targetId)
        .map((a) => a.targetId as string)
    ),
  ];

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const totalAnswers = attempt.answers.length;
  const answerScore = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

  return {
    attempt,
    aiQuestionsAsked,
    evidenceViewed,
    correctAnswers,
    totalAnswers,
    answerScore,
  };
}
