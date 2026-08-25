import { prisma } from "@/lib/db/prisma";
import { type MissionRecommendation } from "./schemas";

// ============================================================
// SKILL DEFINITIONS
// ============================================================

export const ALL_SKILLS = [
  "phishing",
  "credential_theft",
  "authentication",
  "authorization",
  "networking",
  "ioc_analysis",
  "incident_response",
  "web_security",
  "cryptography",
] as const;

export type Skill = (typeof ALL_SKILLS)[number];

// ============================================================
// MASTERY UPDATE ALGORITHM
// ============================================================

/**
 * Bayesian-like mastery update.
 * newMastery = (oldMastery * 0.7) + (performance * 0.3)
 * Then apply positive/negative adjustments.
 */
export function calculateNewMastery(
  oldMastery: number,
  performance: number, // 0.0 - 1.0
  adjustments: {
    hadMisconception?: boolean;
    solvedIndependently?: boolean;
    usedHintsExcessively?: boolean;
  } = {}
): number {
  let newMastery = oldMastery * 0.7 + performance * 0.3;

  if (adjustments.solvedIndependently) newMastery += 0.05;
  if (adjustments.hadMisconception) newMastery -= 0.1;
  if (adjustments.usedHintsExcessively) newMastery -= 0.05;

  return Math.max(0.0, Math.min(1.0, newMastery));
}

// ============================================================
// SKILL UPDATER
// ============================================================

export async function updateLearnerSkills(
  userId: string,
  skillDeltas: Array<{ name: string; masteryDelta: number }>,
  context: {
    hasMisconceptions: boolean;
    aiQuestionsAsked: number;
    totalActions: number;
  }
): Promise<void> {
  const existingSkills = await prisma.learnerSkill.findMany({
    where: { userId },
  });

  const skillMap = new Map(existingSkills.map((s) => [s.skill, s]));

  for (const delta of skillDeltas) {
    const existing = skillMap.get(delta.name);
    const oldMastery = existing?.mastery ?? 0.5;
    
    // Normalize delta to performance score
    const performance = Math.max(0, Math.min(1, 0.5 + delta.masteryDelta));

    const newMastery = calculateNewMastery(oldMastery, performance, {
      hadMisconception: context.hasMisconceptions,
      usedHintsExcessively: context.aiQuestionsAsked > 8,
      solvedIndependently: context.aiQuestionsAsked === 0,
    });

    await prisma.learnerSkill.upsert({
      where: { userId_skill: { userId, skill: delta.name } },
      update: {
        mastery: newMastery,
        attempts: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        userId,
        skill: delta.name,
        mastery: newMastery,
        confidence: 0.5,
        attempts: 1,
      },
    });
  }
}

// ============================================================
// DETERMINISTIC RECOMMENDATION ENGINE
// ============================================================

export interface RecommendationContext {
  weakestSkill: string;
  weakestMastery: number;
  recentMissions: string[];
}

/**
 * Deterministically find the weakest skill that has a corresponding mission.
 * This is pure logic — no LLM involved.
 */
export async function findWeakestSkillWithMission(
  userId: string
): Promise<RecommendationContext | null> {
  const skills = await prisma.learnerSkill.findMany({
    where: { userId },
    orderBy: { mastery: "asc" },
  });

  const recentAttempts = await prisma.missionAttempt.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 3,
    select: { missionId: true },
  });

  const recentMissionIds = recentAttempts.map((a) => a.missionId);

  if (skills.length === 0) {
    return { weakestSkill: "phishing", weakestMastery: 0.5, recentMissions: [] };
  }

  const weakest = skills[0];
  return {
    weakestSkill: weakest.skill,
    weakestMastery: weakest.mastery,
    recentMissions: recentMissionIds,
  };
}

/**
 * Recommend the next mission based on the learner's weakest skill.
 * Deterministic first, AI reasoning as enhancement.
 */
export async function recommendNextMission(
  userId: string
): Promise<MissionRecommendation | null> {
  const context = await findWeakestSkillWithMission(userId);
  if (!context) return null;

  // Find a published mission targeting the weak skill that hasn't been recently completed
  const mission = await prisma.mission.findFirst({
    where: {
      status: "PUBLISHED",
      id: { notIn: context.recentMissions },
      skills: {
        some: { skill: context.weakestSkill },
      },
    },
    orderBy: { order: "asc" },
    include: { skills: true },
  });

  if (!mission) {
    // Fallback: any published mission not recently completed
    const fallback = await prisma.mission.findFirst({
      where: {
        status: "PUBLISHED",
        id: { notIn: context.recentMissions },
      },
      orderBy: { order: "asc" },
    });

    if (!fallback) return null;

    return {
      missionSlug: fallback.slug,
      missionTitle: fallback.title,
      reason: "Continue building your cybersecurity investigation skills.",
      targetSkill: context.weakestSkill,
      urgency: "medium",
    };
  }

  const masteryPercent = Math.round(context.weakestMastery * 100);
  const urgency =
    context.weakestMastery < 0.4
      ? "high"
      : context.weakestMastery < 0.65
      ? "medium"
      : "low";

  return {
    missionSlug: mission.slug,
    missionTitle: mission.title,
    reason: `Your ${context.weakestSkill.replace(/_/g, " ")} skill is at ${masteryPercent}% mastery. This mission directly targets that area.`,
    targetSkill: context.weakestSkill,
    urgency,
  };
}
