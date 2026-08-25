import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { recommendNextMission } from "@/lib/ai/recommender";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  TrendingUp,
  ChevronRight,
  Shield,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attempt?: string }>;
}

export const metadata: Metadata = {
  title: "Mission Results | CyberQuest AI",
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
    </svg>
  );
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { attempt: attemptId } = await searchParams;

  let user;
  try {
    user = await requireDbUser();
  } catch {
    redirect("/sign-in");
  }

  if (!attemptId) redirect(`/missions/${slug}`);

  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId, userId: user.id },
    include: {
      mission: true,
      evaluation: true,
      actions: { orderBy: { createdAt: "asc" } },
      answers: { include: { question: true } },
    },
  });

  if (!attempt) notFound();

  const evaluation = attempt.evaluation;
  const recommendation = await recommendNextMission(user.id);
  const skills = await prisma.learnerSkill.findMany({
    where: { userId: user.id },
    orderBy: { mastery: "desc" },
  });

  const overallScore = attempt.score ?? evaluation?.overallScore ?? 0;

  const strengths = (evaluation?.strengths as string[]) ?? [];
  const weaknesses = (evaluation?.weaknesses as string[]) ?? [];
  const misconceptions = (evaluation?.misconceptions as string[]) ?? [];
  const recommendations = (evaluation?.recommendations as string[]) ?? [];

  const scoreColor = overallScore >= 80 ? "text-emerald-400" : overallScore >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-500" />
          <span className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-semibold">
            Investigation Complete
          </span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-cyan-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-2">
          {attempt.mission.title}
        </h1>
        <p className="text-slate-400">
          {evaluation?.summary ?? "Your investigation has been evaluated."}
        </p>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Overall Score", value: overallScore, key: "overall" },
          { label: "Investigation", value: evaluation?.investigationScore ?? attempt.investigationScore ?? 0, key: "investigation" },
          { label: "Reasoning", value: evaluation?.reasoningScore ?? attempt.reasoningScore ?? 0, key: "reasoning" },
          { label: "Knowledge", value: evaluation?.knowledgeScore ?? attempt.accuracyScore ?? 0, key: "knowledge" },
        ].map((s) => {
          const val = Math.round(s.value ?? 0);
          const color = val >= 80 ? "text-emerald-400" : val >= 60 ? "text-yellow-400" : "text-red-400";
          return (
            <div key={s.key} className={cn(
              "p-5 rounded-xl border flex flex-col items-center gap-2",
              s.key === "overall"
                ? "border-cyan-500/30 bg-cyan-500/5"
                : "border-slate-800 bg-slate-900/50"
            )}>
              <div className="relative">
                <ScoreRing score={val} size={72} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-lg font-bold font-mono", color)}>{val}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="font-semibold text-emerald-400">What You Did Well</h2>
            </div>
            <div className="space-y-3">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-4 h-4 text-red-400" />
              <h2 className="font-semibold text-red-400">What You Missed</h2>
            </div>
            <div className="space-y-3">
              {weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Misconceptions — the "wow moment" */}
      {misconceptions.length > 0 && (
        <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-purple-400 text-lg">
              AI Detected Misconception{misconceptions.length > 1 ? "s" : ""}
            </h2>
          </div>
          <div className="space-y-4">
            {misconceptions.map((m, i) => (
              <div key={i} className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm">{m}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold text-cyan-400">What to Learn Next</h2>
            </div>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-cyan-400 font-mono text-xs mt-0.5">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-slate-300">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill updates */}
        {skills.length > 0 && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-300">Skill Profile Updated</h2>
            </div>
            <div className="space-y-2.5">
              {skills.slice(0, 6).map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-28 capitalize">
                    {s.skill.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      style={{ width: `${s.mastery * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">
                    {Math.round(s.mastery * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next mission recommendation */}
      {recommendation && (
        <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-purple-400">Recommended Next Mission</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">{recommendation.reason}</p>
          <Link
            href={`/missions/${recommendation.missionSlug}`}
            className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15 transition-colors group"
          >
            <div>
              <p className="font-bold text-slate-200">{recommendation.missionTitle}</p>
              <p className="text-xs text-purple-300 mt-0.5">
                Targets: {recommendation.targetSkill.replace(/_/g, " ")} ·{" "}
                <span className={cn(
                  recommendation.urgency === "high" ? "text-red-400" :
                  recommendation.urgency === "medium" ? "text-yellow-400" : "text-slate-400"
                )}>
                  {recommendation.urgency.toUpperCase()} priority
                </span>
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:border-slate-600 hover:text-slate-200 transition-all"
        >
          <Shield className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/missions"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-all"
        >
          <Target className="w-4 h-4" />
          View All Missions
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
