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
  Brain,
  Activity,
  Crosshair,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";
import {
  getMasteryColor,
  formatRelativeTime,
  getDifficultyColor,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | CyberQuest AI",
  description: "Your cybersecurity learning command centre",
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

  const avgMastery =
    skills.length > 0
      ? skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length
      : 0.5;

  const completedCount = recentAttempts.filter((a) => a.status === "COMPLETED").length;
  const scoredAttempts = recentAttempts.filter((a) => a.score !== null);
  const avgScore =
    scoredAttempts.length > 0
      ? scoredAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / scoredAttempts.length
      : 0;

  const currentMission = missions[0];

  const securityLevel =
    avgMastery >= 0.8 ? "Expert" :
    avgMastery >= 0.65 ? "Proficient" :
    avgMastery >= 0.45 ? "Developing" : "Novice";

  const securityLevelColor =
    avgMastery >= 0.8 ? "text-emerald-400" :
    avgMastery >= 0.65 ? "text-cyan-400" :
    avgMastery >= 0.45 ? "text-yellow-400" : "text-orange-400";

  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div className="min-h-screen px-5 py-8 max-w-7xl mx-auto">

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold font-mono">
              OPERATOR TERMINAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">
            Welcome back, <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your investigation dashboard — {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-500">
          <Radio className="w-3 h-3 text-emerald-400 pulse-dot" />
          SYSTEM ONLINE
        </div>
      </div>

      {/* ── STAT HUD — 4-column symmetric ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Security Level",
            value: securityLevel,
            subvalue: `${Math.round(avgMastery * 100)}% avg mastery`,
            icon: Shield,
            valueColor: securityLevelColor,
            accentBorder: "border-cyan-500/15",
            accentBg: "bg-cyan-500/5",
            topGlow: "from-cyan-500/20",
          },
          {
            label: "Missions Completed",
            value: completedCount.toString(),
            subvalue: `of ${recentAttempts.length} attempts`,
            icon: Target,
            valueColor: "text-purple-400",
            accentBorder: "border-purple-500/15",
            accentBg: "bg-purple-500/5",
            topGlow: "from-purple-500/20",
          },
          {
            label: "Avg Score",
            value: avgScore > 0 ? `${Math.round(avgScore)}%` : "—",
            subvalue: "across all missions",
            icon: TrendingUp,
            valueColor: "text-emerald-400",
            accentBorder: "border-emerald-500/15",
            accentBg: "bg-emerald-500/5",
            topGlow: "from-emerald-500/20",
          },
          {
            label: "Skills Tracked",
            value: skills.length.toString(),
            subvalue: "domains monitored",
            icon: Zap,
            valueColor: "text-yellow-400",
            accentBorder: "border-yellow-500/15",
            accentBg: "bg-yellow-500/5",
            topGlow: "from-yellow-500/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`hud-widget relative rounded-xl border ${stat.accentBorder} ${stat.accentBg} p-5 overflow-hidden flex flex-col gap-3`}
          >
            {/* Top gradient shimmer */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.topGlow} to-transparent`} />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.valueColor} opacity-70`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${stat.valueColor}`}>{stat.value}</p>
              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">{stat.subvalue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID — 2/3 + 1/3 ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Featured mission */}
          {currentMission && (
            <div className="glass-card rounded-2xl border border-slate-800/60 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wide">
                    Featured Mission
                  </h2>
                </div>
                <Link
                  href="/missions"
                  className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  All missions <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-xl border border-cyan-500/15 bg-cyan-500/5 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-500/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-500/30" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${getDifficultyColor(currentMission.difficulty)}`}>
                        {currentMission.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono uppercase tracking-wider">
                        MISSION {String(currentMission.order ?? 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-black text-xl text-slate-100 mb-1.5">
                      {currentMission.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {currentMission.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/missions/${currentMission.slug}`}
                  className="btn-tactical inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-slate-900 font-black text-sm hover:bg-cyan-400 transition-colors glow-cyan-sm"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Begin Investigation
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wide">
                Recent Activity
              </h2>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-600">No missions started yet.</p>
                <p className="text-xs text-slate-700 mt-1">Begin your first investigation above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/60 hover:border-slate-700/60 hover:bg-slate-800/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        attempt.status === "COMPLETED"
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-yellow-500/10 border border-yellow-500/20"
                      }`}>
                        {attempt.status === "COMPLETED" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">
                          {attempt.mission.title}
                        </p>
                        <p className="text-xs text-slate-600 font-mono">
                          {formatRelativeTime(attempt.startedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {attempt.score !== null && (
                        <span className={`text-sm font-mono font-black ${
                          attempt.score >= 80 ? "text-emerald-400" :
                          attempt.score >= 60 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {Math.round(attempt.score)}%
                        </span>
                      )}
                      {attempt.status === "IN_PROGRESS" && (
                        <Link
                          href={`/missions/${attempt.mission.slug}/investigate`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 transition-colors font-semibold"
                        >
                          Resume
                        </Link>
                      )}
                      {attempt.status === "COMPLETED" && (
                        <Link
                          href={`/missions/${attempt.mission.slug}/results?attempt=${attempt.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-700/60 transition-colors"
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

        {/* Right — 1/3 */}
        <div className="flex flex-col gap-5">

          {/* Skill profile */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400/70" />
                <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Skill Radar</h2>
              </div>
              <Link href="/profile" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">
                Full profile →
              </Link>
            </div>

            {skills.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-600">Complete a mission to build your skill profile.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {skills.slice(0, 7).map((skill) => (
                  <div key={skill.skill} className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-600 w-24 capitalize flex-shrink-0 font-mono">
                      {skill.skill.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${skill.mastery * 100}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-mono font-bold w-8 text-right flex-shrink-0 ${getMasteryColor(skill.mastery)}`}>
                      {Math.round(skill.mastery * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          {recommendation && (
            <div className="glass-card rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                  AI Recommendation
                </span>
                <AlertTriangle className={`w-3.5 h-3.5 ml-auto ${
                  recommendation.urgency === "high" ? "text-red-400" :
                  recommendation.urgency === "medium" ? "text-yellow-400" : "text-slate-500"
                }`} />
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{recommendation.reason}</p>
              <Link
                href={`/missions/${recommendation.missionSlug}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15 transition-all group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-200">{recommendation.missionTitle}</p>
                  <p className="text-xs text-purple-400 mt-0.5">
                    Target: {recommendation.targetSkill.replace(/_/g, " ")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Focus areas */}
          {skills.length > 0 && (
            <div className="glass-card rounded-2xl border border-slate-800/60 p-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400/60" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                  Critical Gaps
                </h3>
              </div>
              <div className="space-y-2.5">
                {skills.filter((s) => s.mastery < 0.5).slice(0, 3).map((skill) => (
                  <div key={skill.skill} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 capitalize flex-1">
                      {skill.skill.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {Math.round(skill.mastery * 100)}%
                    </span>
                  </div>
                ))}
                {skills.filter((s) => s.mastery < 0.5).length === 0 && (
                  <p className="text-xs text-emerald-400/70 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    No critical gaps detected
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
