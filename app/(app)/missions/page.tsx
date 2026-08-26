import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  Lock,
  Crosshair,
  BookOpen,
} from "lucide-react";
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

  const attemptMap = new Map(attempts.map((a) => [a.missionId, a]));

  return (
    <div>
      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold font-mono">
            MISSION LIBRARY
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-100 mb-2">
          Choose Your Investigation
        </h1>
        <p className="text-slate-400 max-w-xl leading-relaxed">
          Each mission places you inside a real cybersecurity incident.
          Analyze evidence, reason with the AI tutor, and submit your findings.
        </p>
      </div>

      {/* ── MISSION CARDS ────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {missions.map((mission, idx) => {
          const attempt = attemptMap.get(mission.id);
          const isCompleted = attempt?.status === "COMPLETED";
          const isInProgress = attempt?.status === "IN_PROGRESS";
          const isLocked = idx > 0 && !attemptMap.has(missions[0].id);
          const isFeatured = idx === 0;

          return (
            <div
              key={mission.id}
              className={`relative rounded-2xl border transition-all overflow-hidden ${
                isFeatured
                  ? "border-cyan-500/25 bg-gradient-to-r from-cyan-500/5 to-transparent"
                  : isLocked
                  ? "border-slate-800/60 bg-slate-900/20 opacity-60"
                  : "border-slate-800/60 bg-slate-900/30 hover:border-slate-700/60 hover:bg-slate-900/50"
              }`}
            >
              {/* Featured highlight line */}
              {isFeatured && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              )}

              <div className="p-7 flex items-start gap-6">
                {/* Mission number badge */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border ${
                  isFeatured
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                    : isLocked
                    ? "bg-slate-800/60 border-slate-700/40 text-slate-700"
                    : "bg-slate-800/60 border-slate-700/40 text-slate-400"
                }`}>
                  {isCompleted
                    ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                    : isLocked
                    ? <Lock className="w-5 h-5" />
                    : String(idx + 1).padStart(2, "0")
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getDifficultyColor(mission.difficulty)}`}>
                      {mission.difficulty}
                    </span>
                    {mission.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.skill}
                        className="text-xs px-2.5 py-1 rounded-full border border-slate-700/60 text-slate-500 bg-slate-800/30"
                      >
                        {s.skill.replace(/_/g, " ")}
                      </span>
                    ))}
                    {isFeatured && (
                      <span className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/25 text-cyan-400 bg-cyan-500/8 font-semibold">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-slate-100 mb-2">
                    {mission.title}
                  </h2>
                  <p className="text-slate-400 mb-5 leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="flex items-center gap-4">
                    {/* Status */}
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                        {attempt?.score ? ` · ${Math.round(attempt.score)}%` : ""}
                      </div>
                    )}
                    {isInProgress && (
                      <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        In Progress
                      </div>
                    )}

                    {/* CTA */}
                    {!isLocked && (
                      <Link
                        href={`/missions/${mission.slug}`}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          isFeatured
                            ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400 glow-cyan-sm"
                            : "bg-slate-700/80 text-slate-200 hover:bg-slate-700 border border-slate-600/40"
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        {isInProgress
                          ? "Resume Investigation"
                          : isCompleted
                          ? "View Results"
                          : "Start Investigation"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {isLocked && (
                      <span className="text-xs text-slate-600 font-mono">
                        Complete Mission 01 to unlock
                      </span>
                    )}
                  </div>
                </div>

                {/* Right meta */}
                <div className="flex-shrink-0 text-right hidden md:block">
                  <div className="text-xs text-slate-600 font-mono mb-1">ATTEMPTS</div>
                  <div className="text-2xl font-black text-slate-500">{mission._count.attempts}</div>
                  <div className="text-xs text-slate-700 mt-1">30m est.</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-400 mb-2">No Missions Available</h2>
          <p className="text-slate-600">Check back soon — new investigations are being prepared.</p>
        </div>
      )}
    </div>
  );
}
