import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, LayoutDashboard, Target, User, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | CyberQuest AI",
    template: "%s | CyberQuest AI",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080b12] flex flex-col">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-800/70 bg-[#080b12]/90 backdrop-blur-md flex items-center px-6 gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Cyber<span className="text-cyan-400">Quest</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {[
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/missions", label: "Missions", icon: Target },
            { href: "/profile", label: "Profile", icon: User },
            { href: "/instructor", label: "Instructor", icon: GraduationCap },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          Systems Operational
        </div>

        {/* User */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </nav>

      {/* Page content */}
      <main className="flex-1 mt-14">
        {children}
      </main>
    </div>
  );
}
