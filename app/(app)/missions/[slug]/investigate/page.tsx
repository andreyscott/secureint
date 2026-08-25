import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import InvestigationWorkspace from "@/components/investigation/InvestigationWorkspace";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Investigating | CyberQuest AI`,
  };
}

export default async function InvestigatePage({ params }: PageProps) {
  const { slug } = await params;

  let user;
  try {
    user = await requireDbUser();
  } catch {
    redirect("/sign-in");
  }

  const mission = await prisma.mission.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      evidence: { orderBy: { order: "asc" } },
      questions: { orderBy: { order: "asc" } },
      objectives: { orderBy: { order: "asc" } },
      skills: true,
    },
  });

  if (!mission) notFound();

  // Start/resume attempt
  let attempt = await prisma.missionAttempt.findFirst({
    where: { userId: user.id, missionId: mission.id, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    include: {
      actions: { orderBy: { createdAt: "asc" } },
      aiMessages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!attempt) {
    attempt = await prisma.missionAttempt.create({
      data: { userId: user.id, missionId: mission.id, status: "IN_PROGRESS" },
      include: { actions: true, aiMessages: true },
    });
  }

  // Serialize for client
  const missionData = {
    id: mission.id,
    slug: mission.slug,
    title: mission.title,
    briefing: mission.briefing,
    difficulty: mission.difficulty,
    evidence: mission.evidence.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description,
      content: e.content as Record<string, unknown>,
      order: e.order,
      isKey: e.isKey,
    })),
    questions: mission.questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options as string[] | null,
      order: q.order,
      // Don't send correctData to client!
    })),
    objectives: mission.objectives.map((o) => ({
      id: o.id,
      skill: o.skill,
      description: o.description,
    })),
  };

  const attemptData = {
    id: attempt.id,
    startedAt: attempt.startedAt.toISOString(),
    actions: attempt.actions.map((a) => ({
      id: a.id,
      action: a.action,
      targetId: a.targetId,
      createdAt: a.createdAt.toISOString(),
    })),
    aiMessages: attempt.aiMessages
      .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
      .map((m) => ({
        id: m.id,
        role: m.role as "USER" | "ASSISTANT",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
  };

  return (
    <InvestigationWorkspace
      mission={missionData}
      attempt={attemptData}
      userId={user.id}
    />
  );
}
