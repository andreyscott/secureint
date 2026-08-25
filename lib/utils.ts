import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getMasteryLabel(mastery: number): string {
  if (mastery >= 0.85) return "Expert";
  if (mastery >= 0.7) return "Proficient";
  if (mastery >= 0.5) return "Developing";
  if (mastery >= 0.3) return "Beginner";
  return "Novice";
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 0.85) return "text-emerald-400";
  if (mastery >= 0.7) return "text-cyan-400";
  if (mastery >= 0.5) return "text-yellow-400";
  if (mastery >= 0.3) return "text-orange-400";
  return "text-red-400";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "BEGINNER":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    case "INTERMEDIATE":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "ADVANCED":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getThreatLevelColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-yellow-400";
  return "text-green-400";
}

export function getEvidenceTypeIcon(type: string): string {
  switch (type) {
    case "EMAIL":
      return "Mail";
    case "AUTH_LOG":
      return "ShieldAlert";
    case "DNS":
      return "Globe";
    case "FIREWALL":
      return "Shield";
    case "EDR":
      return "Monitor";
    case "NETWORK":
      return "Network";
    case "WEB_LOG":
      return "FileText";
    case "FILE":
      return "File";
    case "NOTE":
      return "StickyNote";
    default:
      return "File";
  }
}

export function getEvidenceTypeColor(type: string): string {
  switch (type) {
    case "EMAIL":
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    case "AUTH_LOG":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    case "DNS":
      return "text-purple-400 bg-purple-400/10 border-purple-400/30";
    case "FIREWALL":
      return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    case "EDR":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "NETWORK":
      return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
