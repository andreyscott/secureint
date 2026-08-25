import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const user = await requireDbUser();

    const [skills, attempts] = await Promise.all([
      prisma.learnerSkill.findMany({
        where: { userId: user.id },
        orderBy: { mastery: "desc" },
      }),
      prisma.missionAttempt.findMany({
        where: { userId: user.id },
        select: { status: true, score: true },
      }),
    ]);

    const completedAttempts = attempts.filter(a => a.status === "COMPLETED");
    const avgScore = completedAttempts.length > 0
      ? completedAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / completedAttempts.length
      : 0;

    return NextResponse.json({
      user: { name: user.name, email: user.email },
      skills: skills.map(s => ({
        id: s.id,
        skill: s.skill,
        mastery: s.mastery,
        confidence: s.confidence,
        attempts: s.attempts,
        lastUpdated: s.lastUpdated.toISOString(),
      })),
      attemptCount: attempts.length,
      completedCount: completedAttempts.length,
      avgScore,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
