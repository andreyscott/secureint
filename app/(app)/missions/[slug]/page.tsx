import { prisma } from "@/lib/db/prisma";
import { requireDbUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  Shield,
  Target,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  ShieldAlert,
  Globe,
  Network,
  Monitor,
} from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const mission = await prisma.mission.findUnique({ where: { slug } });
  return {
    title: mission ? `${mission.title} | CyberQuest AI` : "Mission | CyberQuest AI",
  };
}

const EVIDENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  AUTH_LOG: ShieldAlert,
  DNS: Globe,
  FIREWALL: Network,
  EDR: Monitor,
  NETWORK: Network,
};

export default async function MissionBriefingPage({ params }: PageProps) {
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
      evidence: { orderBy: { order: "asc" }, select: { type: true, title: true, id: true } },
      objectives: { orderBy: { order: "asc" } },
      skills: true,
    },
  });

  if (!mission) notFound();

  const existingAttempt = await prisma.missionAttempt.findFirst({
    where: { userId: user.id, missionId: mission.id },
    orderBy: { startedAt: "desc" },
  });

  const threatLevelMap: Record<string, { label: string; color: string; bg: string }> = {
    BEGINNER: { label: "MEDIUM", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
    INTERMEDIATE: { label: "HIGH", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
    ADVANCED: { label: "CRITICAL", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
  };

  const threat = threatLevelMap[mission.difficulty] ?? threatLevelMap.BEGINNER;

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/missions" className="hover:text-slate-300 transition-colors">
          Missions
        </Link>
        <span>/</span>
        <span className="text-slate-300">{mission.title}</span>
      </div>

      {/* Mission header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getDifficultyColor(mission.difficulty)}`}>
            {mission.difficulty}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${threat.bg} ${threat.color}`}>
            THREAT LEVEL: {threat.label}
          </span>
          {existingAttempt?.status === "IN_PROGRESS" && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-semibold">
              IN PROGRESS
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{mission.title}</h1>
        <p className="text-slate-400">{mission.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Briefing */}
        <div className="md:col-span-2 space-y-6">
          {/* Scenario briefing */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h2 className="font-semibold text-slate-200">Mission Briefing</h2>
            </div>
            <pre className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-mono bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              {mission.briefing}
            </pre>
          </div>

          {/* Objectives */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold text-slate-200">Investigation Objectives</h2>
            </div>
            <div className="space-y-3">
              {mission.objectives.map((obj, idx) => (
                <div key={obj.id} className="flex items-start gap-3">
                  <span className="text-xs font-mono text-cyan-400 mt-0.5 flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm text-slate-300">{obj.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      Skill: {obj.skill.replace(/_/g, " ")} · Weight: {Math.round(obj.weight * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Available evidence */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-300 text-sm">Available Evidence</h2>
            </div>
            <div className="space-y-2">
              {mission.evidence.map((ev) => {
                const Icon = EVIDENCE_ICONS[ev.type] ?? Shield;
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-800/50 text-sm"
                  >
                    <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills tested */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <h2 className="font-semibold text-slate-300 text-sm mb-3">Skills Being Tested</h2>
            <div className="flex flex-wrap gap-2">
              {mission.skills.map((s) => (
                <span
                  key={s.skill}
                  className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                >
                  {s.skill.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Duration estimate */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-400">Estimated Time</p>
              <p className="text-xs text-slate-500">20–35 minutes</p>
            </div>
          </div>

          {/* Begin button */}
          <Link
            href={`/missions/${mission.slug}/investigate`}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cyan-500 text-slate-900 font-bold text-base hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            {existingAttempt?.status === "IN_PROGRESS" ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Resume Investigation
              </>
            ) : (
              <>
                <ChevronRight className="w-5 h-5" />
                Begin Investigation
              </>
            )}
          </Link>

          {existingAttempt?.status === "COMPLETED" && (
            <Link
              href={`/missions/${mission.slug}/results?attempt=${existingAttempt.id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:border-slate-600 hover:text-slate-300 transition-all"
            >
              View Last Results
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
