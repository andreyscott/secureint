"use client";

import { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Shield,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { cn, getMasteryColor, getMasteryLabel } from "@/lib/utils";

interface Skill {
  id: string;
  skill: string;
  mastery: number;
  confidence: number;
  attempts: number;
  lastUpdated: string;
}

interface ProfileData {
  user: { name: string | null; email: string };
  skills: Skill[];
  attemptCount: number;
  completedCount: number;
  avgScore: number;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const radarData = data.skills.map((s) => ({
    skill: s.skill.replace(/_/g, " "),
    value: Math.round(s.mastery * 100),
    fullMark: 100,
  }));

  const strongest = [...data.skills].sort((a, b) => b.mastery - a.mastery).slice(0, 3);
  const weakest = [...data.skills].sort((a, b) => a.mastery - b.mastery).slice(0, 3);

  return (
    <div className="min-h-screen px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">
          Security Profile
        </h1>
        <p className="text-slate-500 text-sm">
          {data.user.name ?? data.user.email} · {data.completedCount} missions completed
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Missions Attempted", value: data.attemptCount, icon: Target, color: "text-cyan-400" },
          { label: "Completed", value: data.completedCount, icon: Award, color: "text-emerald-400" },
          { label: "Avg Score", value: `${Math.round(data.avgScore)}%`, icon: TrendingUp, color: "text-purple-400" },
          { label: "Skills Tracked", value: data.skills.length, icon: Shield, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Radar chart */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="font-semibold text-slate-300 mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Radar
                name="Mastery"
                dataKey="value"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1117",
                  border: "1px solid #1f2937",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill breakdown */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h2 className="font-semibold text-slate-300 mb-4">All Skills</h2>
          <div className="space-y-3">
            {data.skills.map((skill) => (
              <div key={skill.skill} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0">
                  <p className="text-xs text-slate-400 capitalize truncate">
                    {skill.skill.replace(/_/g, " ")}
                  </p>
                  <p className={cn("text-[10px] font-semibold", getMasteryColor(skill.mastery))}>
                    {getMasteryLabel(skill.mastery)}
                  </p>
                </div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                    style={{ width: `${skill.mastery * 100}%` }}
                  />
                </div>
                <span className={cn("text-xs font-mono w-10 text-right", getMasteryColor(skill.mastery))}>
                  {Math.round(skill.mastery * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest */}
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Strongest Skills</h3>
          </div>
          <div className="space-y-3">
            {strongest.map((s) => (
              <div key={s.skill} className="flex items-center justify-between">
                <p className="text-sm text-slate-300 capitalize">{s.skill.replace(/_/g, " ")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {Math.round(s.mastery * 100)}%
                  </span>
                  <span className="text-xs text-slate-500">{s.attempts} attempts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest */}
        <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400">Focus Areas</h3>
          </div>
          <div className="space-y-3">
            {weakest.map((s) => (
              <div key={s.skill} className="flex items-center justify-between">
                <p className="text-sm text-slate-300 capitalize">{s.skill.replace(/_/g, " ")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-red-400">
                    {Math.round(s.mastery * 100)}%
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {s.attempts} attempts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
