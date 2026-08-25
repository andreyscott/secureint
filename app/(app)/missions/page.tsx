import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Target, ChevronRight, Clock, CheckCircle, Lock } from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Missions | CyberQuest AI",
  description: "Browse and start cybersecurity investigation missions",
};

export default async function MissionsPage() {
  let user;
  try {
    user = await requireDbUser();
  } catch {
    redirect("/sign-in");
  }

  const [missions, attempts] = await Promise.all([
    prisma.mission.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: {
        skills: true,
        _count: { select: { attempts: true } },
      },
    }),
    prisma.missionAttempt.findMany({
      where: { userId: user.id },
      select: { missionId: true, status: true, score: true },
    }),
  ]);

  const attemptMap = new Map(
    attempts.map((a) => [a.missionId, a])
  );

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Mission Library</h1>
        <p className="text-slate-500 text-sm">
          Select a mission to begin your investigation. Missions adapt to your skill level.
        </p>
      </div>

      <div className="grid gap-4">
        {missions.map((mission, idx) => {
          const attempt = attemptMap.get(mission.id);
          const isCompleted = attempt?.status === "COMPLETED";
          const isInProgress = attempt?.status === "IN_PROGRESS";
          const isLocked = idx > 0 && !attemptMap.has(missions[0].id);

          return (
            <div
              key={mission.id}
              className={`p-6 rounded-xl border transition-all ${
                idx === 0
                  ? "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50"
                  : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-6">
                {/* Mission number */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border ${
                  idx === 0
                    ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}>
                  {String(idx + 1).padStart(2, "0")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(mission.difficulty)}`}>
                      {mission.difficulty}
                    </span>
                    {mission.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.skill}
                        className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-500"
                      >
                        {s.skill.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-lg font-bold text-slate-100 mb-1">
                    {mission.title}
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">
                    {mission.description}
                  </p>

                  <div className="flex items-center gap-4">
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Completed · {attempt?.score ? `${Math.round(attempt.score)}%` : ""}
                      </div>
                    )}
                    {isInProgress && (
                      <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                        <Clock className="w-4 h-4" />
                        In Progress
                      </div>
                    )}

                    <Link
                      href={`/missions/${mission.slug}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        idx === 0
                          ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {isInProgress ? "Resume Mission" : isCompleted ? "Replay Mission" : "View Mission"}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Lock/Status icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Target className={`w-5 h-5 ${idx === 0 ? "text-cyan-400" : "text-slate-600"}`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
