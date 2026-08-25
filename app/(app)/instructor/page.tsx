import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { Users, AlertTriangle, TrendingDown, Brain } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructor Dashboard | CyberQuest AI",
};

export default async function InstructorPage() {
  let user;
  try {
    user = await requireDbUser();
  } catch {
    redirect("/sign-in");
  }

  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Aggregate skill data across all students
  const allSkills = await prisma.learnerSkill.groupBy({
    by: ["skill"],
    _avg: { mastery: true },
    _count: { id: true },
  });

  const allMisconceptions = await prisma.aIEvaluation.findMany({
    select: { misconceptions: true },
    take: 100,
  });

  // Count misconception frequency
  const misconceptionCounts: Record<string, number> = {};
  for (const eval_ of allMisconceptions) {
    const misconceptions = eval_.misconceptions as string[];
    for (const m of misconceptions) {
      const key = m.substring(0, 80);
      misconceptionCounts[key] = (misconceptionCounts[key] ?? 0) + 1;
    }
  }

  const topMisconceptions = Object.entries(misconceptionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalAttempts = await prisma.missionAttempt.count();
  const completedAttempts = await prisma.missionAttempt.count({ where: { status: "COMPLETED" } });

  const weakSkills = allSkills
    .filter(s => (s._avg.mastery ?? 0) < 0.5)
    .sort((a, b) => (a._avg.mastery ?? 0) - (b._avg.mastery ?? 0));

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Instructor Analytics</h1>
        <p className="text-slate-500 text-sm">Aggregate learning intelligence across your class</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Students", value: totalStudents, icon: Users, color: "text-cyan-400" },
          { label: "Mission Attempts", value: totalAttempts, icon: Brain, color: "text-purple-400" },
          { label: "Completed", value: completedAttempts, icon: TrendingDown, color: "text-emerald-400" },
          { label: "Completion Rate", value: totalAttempts > 0 ? `${Math.round(completedAttempts / totalAttempts * 100)}%` : "—", icon: AlertTriangle, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class skill averages */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="font-semibold text-slate-300 mb-4">Class Skill Averages</h2>
          <div className="space-y-3">
            {allSkills.sort((a, b) => (a._avg.mastery ?? 0) - (b._avg.mastery ?? 0)).map((s) => {
              const pct = Math.round((s._avg.mastery ?? 0) * 100);
              const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 capitalize">
                    {s.skill.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">{pct}%</span>
                  <span className="text-xs text-slate-600 w-16 text-right">{s._count.id} students</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common misconceptions */}
        <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-purple-400">Common Misconceptions</h2>
          </div>
          {topMisconceptions.length === 0 ? (
            <p className="text-sm text-slate-500">No misconception data yet. Students need to complete missions first.</p>
          ) : (
            <div className="space-y-3">
              {topMisconceptions.map(([misconception, count], i) => (
                <div key={i} className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-slate-300">{misconception}...</p>
                    <span className="text-xs text-purple-400 font-mono flex-shrink-0">{count}×</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical gaps */}
        {weakSkills.length > 0 && (
          <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="font-semibold text-red-400">Critical Class Gaps</h2>
              <span className="text-xs text-slate-500">(skills below 50% average mastery)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {weakSkills.map((s) => (
                <div key={s.skill} className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-2">
                  <span className="text-sm text-slate-300 capitalize">{s.skill.replace(/_/g, " ")}</span>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {Math.round((s._avg.mastery ?? 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
