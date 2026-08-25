import { requireDbUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { recommendNextMission } from "@/lib/ai/recommender";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Target,
  TrendingUp,
  ChevronRight,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { getMasteryColor, getMasteryLabel, formatRelativeTime, getDifficultyColor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | CyberQuest AI",
  description: "Your cybersecurity learning dashboard",
};

export default async function DashboardPage() {
  let user;
  try {
    user = await requireDbUser();
  } catch {
    redirect("/sign-in");
  }

  const [skills, recentAttempts, missions, recommendation] = await Promise.all([
    prisma.learnerSkill.findMany({
      where: { userId: user.id },
      orderBy: { mastery: "desc" },
    }),
    prisma.missionAttempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: { mission: true },
    }),
    prisma.mission.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      take: 3,
    }),
    recommendNextMission(user.id),
  ]);

  const avgMastery = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length
    : 0.5;

  const completedCount = recentAttempts.filter(a => a.status === "COMPLETED").length;
  const avgScore = recentAttempts.filter(a => a.score !== null).length > 0
    ? recentAttempts.filter(a => a.score !== null).reduce((sum, a) => sum + (a.score ?? 0), 0) /
      recentAttempts.filter(a => a.score !== null).length
    : 0;

  const currentMission = missions[0];

  const securityLevel = avgMastery >= 0.8 ? "Expert" : avgMastery >= 0.65 ? "Proficient" : avgMastery >= 0.45 ? "Developing" : "Novice";
  const securityLevelColor = avgMastery >= 0.8 ? "text-emerald-400" : avgMastery >= 0.65 ? "text-cyan-400" : avgMastery >= 0.45 ? "text-yellow-400" : "text-orange-400";

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-bold text-slate-100">
          {user.name ?? user.email.split("@")[0]}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Security Level",
            value: securityLevel,
            subvalue: `${Math.round(avgMastery * 100)}% avg mastery`,
            icon: Shield,
            color: securityLevelColor,
            bg: "border-cyan-500/20 bg-cyan-500/5",
          },
          {
            label: "Missions Completed",
            value: completedCount.toString(),
            subvalue: `of ${recentAttempts.length} attempts`,
            icon: Target,
            color: "text-purple-400",
            bg: "border-purple-500/20 bg-purple-500/5",
          },
          {
            label: "Avg Score",
            value: avgScore > 0 ? `${Math.round(avgScore)}%` : "—",
            subvalue: "across all missions",
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "border-emerald-500/20 bg-emerald-500/5",
          },
          {
            label: "Skills Tracked",
            value: skills.length.toString(),
            subvalue: "domains monitored",
            icon: Zap,
            color: "text-yellow-400",
            bg: "border-yellow-500/20 bg-yellow-500/5",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-xl border ${stat.bg} flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.subvalue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Current/Featured Mission */}
          {currentMission && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-300">Featured Mission</h2>
                <Link
                  href="/missions"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  All missions <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(currentMission.difficulty)}`}>
                        {currentMission.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">MISSION 01</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100">
                      {currentMission.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {currentMission.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/missions/${currentMission.slug}`}
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-slate-900 font-bold text-sm hover:bg-cyan-400 transition-colors"
                >
                  Begin Investigation
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <h2 className="font-semibold text-slate-300 mb-4">Recent Activity</h2>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No missions started yet. Begin your first investigation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {attempt.status === "COMPLETED" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          {attempt.mission.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatRelativeTime(attempt.startedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {attempt.score !== null && (
                        <span className={`text-sm font-mono font-bold ${
                          attempt.score >= 80 ? "text-emerald-400" :
                          attempt.score >= 60 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {Math.round(attempt.score)}%
                        </span>
                      )}
                      {attempt.status === "IN_PROGRESS" && (
                        <Link
                          href={`/missions/${attempt.mission.slug}/investigate`}
                          className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        >
                          Resume
                        </Link>
                      )}
                      {attempt.status === "COMPLETED" && (
                        <Link
                          href={`/missions/${attempt.mission.slug}/results?attempt=${attempt.id}`}
                          className="text-xs px-3 py-1 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Skill Profile */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-300">Skill Profile</h2>
              <Link
                href="/profile"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Full profile →
              </Link>
            </div>
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Complete a mission to build your skill profile
              </p>
            ) : (
              <div className="space-y-3">
                {skills.slice(0, 7).map((skill) => (
                  <div key={skill.skill} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 capitalize">
                      {skill.skill.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${skill.mastery * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-8 text-right ${getMasteryColor(skill.mastery)}`}>
                      {Math.round(skill.mastery * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          {recommendation && (
            <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`w-4 h-4 ${
                  recommendation.urgency === "high" ? "text-red-400" :
                  recommendation.urgency === "medium" ? "text-yellow-400" : "text-slate-400"
                }`} />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  AI Recommendation
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-3">{recommendation.reason}</p>
              <Link
                href={`/missions/${recommendation.missionSlug}`}
                className="flex items-center justify-between p-3 rounded-lg border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {recommendation.missionTitle}
                  </p>
                  <p className="text-xs text-purple-300">
                    Targets: {recommendation.targetSkill.replace(/_/g, " ")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </Link>
            </div>
          )}

          {/* Weak Skills Warning */}
          {skills.length > 0 && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Focus Areas</h3>
              <div className="space-y-2">
                {skills
                  .filter(s => s.mastery < 0.5)
                  .slice(0, 3)
                  .map((skill) => (
                    <div key={skill.skill} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400 capitalize">
                        {skill.skill.replace(/_/g, " ")}
                      </span>
                      <span className="ml-auto text-xs font-mono text-red-400">
                        {Math.round(skill.mastery * 100)}%
                      </span>
                    </div>
                  ))}
                {skills.filter(s => s.mastery < 0.5).length === 0 && (
                  <p className="text-xs text-slate-500">No critical gaps detected</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
