import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Target,
  User,
  GraduationCap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | CyberQuest AI",
    template: "%s | CyberQuest AI",
  },
};

const NAV_LINKS = [
  { href: "/dashboard",   label: "Dashboard",  icon: LayoutDashboard },
  { href: "/missions",    label: "Missions",   icon: Target          },
  { href: "/profile",     label: "Profile",    icon: User            },
  { href: "/instructor",  label: "Instructor", icon: GraduationCap   },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060810] flex flex-col">

      {/* ── TOP NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-800/60 bg-[#060810]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center gap-8">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/15 transition-colors">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-black text-sm tracking-tight text-slate-100">
              Cyber<span className="text-cyan-400">Quest</span>
              <span className="text-slate-500 font-normal"> AI</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-800 flex-shrink-0" />

          {/* Nav links — centred in remaining space */}
          <div className="flex items-center gap-1 flex-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-150"
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right — status + user */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              LIVE
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-1 ring-slate-700 hover:ring-cyan-500/50 transition-all",
                },
              }}
            />
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ────────────────────────────────────────── */}
      {/* mt-16 = exact nav height so content starts below it */}
      <main className="flex-1 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/40 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-mono">
            <Shield className="w-3 h-3 text-cyan-400/40" />
            CyberQuest AI v0.1.0
          </div>
          <p className="text-slate-800 text-[11px] font-mono">
            ALL SCENARIOS ARE SIMULATED
          </p>
        </div>
      </footer>
    </div>
  );
}
