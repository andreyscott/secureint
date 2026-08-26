"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Brain,
  Target,
  ChevronRight,
  Eye,
  Network,
  AlertTriangle,
  TrendingUp,
  Search,
  Mail,
  ShieldAlert,
  Globe,
  Activity,
  Lock,
  Cpu,
  Radio,
  Crosshair,
  BarChart3,
} from "lucide-react";

/* ── animation presets ────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── small reusable label ─────────────────────────────────────── */
function SectionLabel({ text, color = "text-cyan-400" }: { text: string; color?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] ${color} mb-5`}>
      <span className="w-6 h-px bg-current opacity-50" />
      {text}
      <span className="w-6 h-px bg-current opacity-50" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060810] text-slate-200 overflow-x-hidden">
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-8 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan-sm">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Cyber<span className="text-cyan-400">Quest</span>{" "}
              <span className="text-slate-500 font-normal text-sm">AI</span>
            </span>
          </div>

          {/* Center status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[11px] text-cyan-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
            SYSTEM ONLINE — 3 ACTIVE MISSIONS
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="btn-tactical text-sm px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors glow-cyan-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-44 pb-28 px-6 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 cyber-grid" />
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Central radial glow — symmetrical */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-cyan-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/[0.04] rounded-full blur-[80px]" />
        </div>

        {/* Symmetrical corner decorations */}
        <div className="absolute top-24 left-8 w-24 h-24 border-l border-t border-cyan-500/10" />
        <div className="absolute top-24 right-8 w-24 h-24 border-r border-t border-cyan-500/10" />
        <div className="absolute bottom-8 left-8 w-24 h-24 border-l border-b border-cyan-500/10" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r border-b border-cyan-500/10" />

        <div className="max-w-7xl mx-auto relative">
          {/* Centre-aligned hero content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Status badge */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
                AI-Powered Cybersecurity Training Platform
                <Radio className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.02]"
            >
              Cybersecurity isn&apos;t{" "}
              <span className="relative inline-block">
                <span className="text-slate-600">memorization.</span>
              </span>
              <br />
              It&apos;s{" "}
              <span className="gradient-text">investigation.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              CyberQuest AI drops you inside real cybersecurity incidents. Analyze
              evidence, reason with an AI tutor, and build skills that actually work
              under pressure.
            </motion.p>

            {/* CTA — symmetrical pair */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/sign-up"
                className="btn-tactical group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-cyan-500 text-slate-900 font-black text-base hover:bg-cyan-400 transition-all glow-cyan"
              >
                <Crosshair className="w-4 h-4" />
                Start Your First Mission
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-tactical inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl border border-slate-700/60 text-slate-300 font-semibold text-base hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                How It Works
              </a>
            </motion.div>

            {/* Trust indicators — symmetrical 3-up */}
            <motion.div variants={fadeUp} className="flex justify-center gap-8 text-xs text-slate-600">
              {["3 Active Missions", "AI Socratic Tutor", "Real Evidence Analysis"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── SOC TERMINAL PREVIEW ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 relative float"
          >
            {/* Glow halo behind terminal */}
            <div className="absolute -inset-8 bg-gradient-to-b from-cyan-500/8 via-transparent to-purple-500/5 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-slate-700/40 bg-[#080c18] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 bg-[#06090f] border-b border-slate-800/80">
                <div className="w-3 h-3 rounded-full bg-[#ff3b30]/70" />
                <div className="w-3 h-3 rounded-full bg-[#ffcc02]/70" />
                <div className="w-3 h-3 rounded-full bg-[#34c759]/70" />
                <div className="mx-4 flex-1 h-6 rounded-md bg-slate-800/60 border border-slate-700/40 flex items-center px-3 gap-2">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[11px] text-slate-500 font-mono">
                    cyberquest.ai/missions/compromised-employee/investigate
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyan-500/25 bg-cyan-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">LIVE</span>
                </div>
              </div>

              {/* 4-panel investigation workspace */}
              <div className="grid grid-cols-12 h-[380px] text-xs">

                {/* Panel 1 — Evidence sidebar */}
                <div className="col-span-2 border-r border-slate-800/60 bg-[#060810] p-3 flex flex-col gap-1.5">
                  <div className="text-slate-600 uppercase tracking-widest text-[9px] font-bold mb-2 flex items-center gap-1.5">
                    <Target className="w-2.5 h-2.5" />
                    EVIDENCE (5)
                  </div>
                  {[
                    { icon: Mail, label: "Phishing Email", color: "text-blue-400", active: true },
                    { icon: ShieldAlert, label: "Auth Logs", color: "text-red-400" },
                    { icon: Globe, label: "DNS Records", color: "text-purple-400" },
                    { icon: Activity, label: "EDR Alert", color: "text-yellow-400" },
                    { icon: Network, label: "Firewall Logs", color: "text-orange-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        item.active
                          ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                          : "border border-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-800/40"
                      }`}
                    >
                      <item.icon className={`w-2.5 h-2.5 ${item.color} flex-shrink-0`} />
                      <span className="text-[10px] leading-tight">{item.label}</span>
                    </div>
                  ))}

                  {/* mini threat gauge */}
                  <div className="mt-auto pt-3 border-t border-slate-800/60">
                    <div className="text-slate-600 text-[9px] uppercase tracking-widest mb-1.5">Threat Level</div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 4 ? "bg-red-500" : "bg-slate-800"}`} />
                      ))}
                    </div>
                    <div className="text-[10px] text-red-400 font-mono font-bold mt-1">HIGH</div>
                  </div>
                </div>

                {/* Panel 2 — Email viewer */}
                <div className="col-span-5 border-r border-slate-800/60 p-4 font-mono overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-slate-500 uppercase tracking-widest text-[9px] font-bold font-sans flex items-center gap-1.5">
                      <Mail className="w-2.5 h-2.5" />
                      EMAIL EVIDENCE
                    </div>
                    <div className="px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-[9px] text-red-400 font-bold font-sans">SUSPICIOUS</div>
                  </div>

                  <div className="space-y-1.5 text-[10px] bg-[#06090f] rounded-lg p-3 border border-slate-800/60">
                    <div className="flex gap-3 py-1 border-b border-slate-800/40">
                      <span className="text-slate-600 w-10 flex-shrink-0">FROM</span>
                      <span className="text-red-400">
                        security@micros<span className="bg-red-400/20 border border-red-400/30 px-0.5 rounded text-red-300">0</span>ft-support.example
                      </span>
                    </div>
                    <div className="flex gap-3 py-1 border-b border-slate-800/40">
                      <span className="text-slate-600 w-10 flex-shrink-0">TO</span>
                      <span className="text-slate-300">m.webb@acmegroup.internal</span>
                    </div>
                    <div className="flex gap-3 py-1 border-b border-slate-800/40">
                      <span className="text-slate-600 w-10 flex-shrink-0">SUBJ</span>
                      <span className="text-slate-300">🔒 Urgent: Unusual sign-in activity detected</span>
                    </div>
                    <div className="pt-2 space-y-1 text-slate-400">
                      <p>Dear Marcus Webb,</p>
                      <p>We detected unusual sign-in activity on your Microsoft 365 account from an unknown location.</p>
                      <p className="text-cyan-400 mt-2">▶ VERIFY MY ACCOUNT NOW</p>
                      <p className="text-red-400 text-[9px]">→ login-micros0ft-support.example/verify/acme</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/8 border border-red-500/25 rounded-lg">
                    <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-300 text-[9px] leading-relaxed">
                      <strong>SPF FAIL</strong> — DKIM mismatch — Typosquatting domain detected (&apos;0&apos; instead of &apos;o&apos;)
                    </span>
                  </div>
                </div>

                {/* Panel 3 — Timeline */}
                <div className="col-span-3 border-r border-slate-800/60 p-3 overflow-hidden">
                  <div className="text-slate-500 uppercase tracking-widest text-[9px] font-bold mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-2.5 h-2.5" />
                    ATTACK TIMELINE
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: "08:41", event: "Phishing email delivered", color: "bg-blue-400", text: "text-blue-300" },
                      { time: "08:53", event: "Link clicked — credential harvest", color: "bg-yellow-400", text: "text-yellow-300" },
                      { time: "09:02", event: "Auth from Kyiv, UA (new device)", color: "bg-red-500", text: "text-red-300" },
                      { time: "09:04", event: "MFA bypass via session hijack", color: "bg-red-500", text: "text-red-300" },
                      { time: "09:11", event: "Exfil attempt — SharePoint", color: "bg-orange-400", text: "text-orange-300" },
                    ].map((ev, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="flex flex-col items-center mt-0.5 flex-shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full ${ev.color}`} />
                          {i < 4 && <div className="w-px h-4 bg-slate-800 mt-0.5" />}
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-600 font-mono">{ev.time}</div>
                          <div className={`text-[10px] ${ev.text} leading-tight`}>{ev.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 4 — AI tutor */}
                <div className="col-span-2 bg-[#080a16] p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-purple-400 uppercase tracking-widest font-bold">
                    <Brain className="w-2.5 h-2.5" />
                    AI ANALYST
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-slate-300 leading-relaxed">
                      What makes the sender domain suspicious here?
                    </div>
                    <div className="p-2 bg-slate-800/40 border border-slate-700/40 rounded-lg text-[10px] text-slate-400 italic">
                      &quot;There&apos;s a zero instead of the letter o?&quot;
                    </div>
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-slate-300 leading-relaxed">
                      Exactly — typosquatting. What other headers should you verify?
                    </div>
                  </div>
                  <div className="p-1.5 bg-[#060810] border border-slate-800/60 rounded-lg flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-700 flex-1">Ask the analyst...</span>
                    <Cpu className="w-2.5 h-2.5 text-purple-400 pulse-dot" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION — mirrored columns ───────────────── */}
      <section className="py-28 px-6 relative border-t border-slate-800/40">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <SectionLabel text="The Problem" color="text-red-400" />
              <h2 className="text-3xl md:text-5xl font-black leading-tight">
                Traditional training leaves you{" "}
                <span className="text-red-400">unprepared</span>
              </h2>
            </motion.div>

            {/* 2×2 symmetric grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {[
                {
                  icon: Search,
                  title: "No Real Investigation Practice",
                  desc: "Memorizing definitions ≠ detecting real attacks. Courses skip the hands-on analysis that actually builds skill.",
                },
                {
                  icon: Brain,
                  title: "AI That Just Gives Answers",
                  desc: "Tools that hand you the answer don't build reasoning. You need to think through evidence, not copy solutions.",
                },
                {
                  icon: Target,
                  title: "Generic Content for Everyone",
                  desc: "One-size-fits-all courses ignore your personal skill gaps. You waste time on what you already know.",
                },
                {
                  icon: TrendingUp,
                  title: "No Adaptive Skill Tracking",
                  desc: "Without precise gap analysis, you can't know what to study next. Progress stays invisible and unmeasured.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="glass-card p-6 rounded-2xl flex gap-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — 3-column symmetric ───────────────────── */}
      <section id="how-it-works" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <SectionLabel text="How CyberQuest Works" />
              <h2 className="text-3xl md:text-5xl font-black">
                The investigation <span className="gradient-text">learning loop</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: Eye,
                  title: "Investigate a Real Incident",
                  desc: "You're placed inside a live cybersecurity scenario. Analyze emails, auth logs, DNS records, firewall logs, and EDR alerts to reconstruct the attack.",
                  accentColor: "text-cyan-400",
                  borderColor: "border-cyan-500/20",
                  bgColor: "bg-cyan-500/5",
                  glowColor: "rgba(0,212,255,0.08)",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "Reason with an AI Socratic Tutor",
                  desc: "Your AI analyst never reveals the answer. It asks targeted questions to challenge your reasoning, expose blind spots, and deepen genuine understanding.",
                  accentColor: "text-purple-400",
                  borderColor: "border-purple-500/20",
                  bgColor: "bg-purple-500/5",
                  glowColor: "rgba(168,85,247,0.08)",
                },
                {
                  step: "03",
                  icon: TrendingUp,
                  title: "Get Personalized AI Feedback",
                  desc: "After submission, AI evaluates your full investigation — not just the final answer. It detects misconceptions, updates your skill radar, and queues your next mission.",
                  accentColor: "text-emerald-400",
                  borderColor: "border-emerald-500/20",
                  bgColor: "bg-emerald-500/5",
                  glowColor: "rgba(0,255,157,0.08)",
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  className={`relative p-8 rounded-2xl border ${item.borderColor} ${item.bgColor} flex flex-col gap-5 overflow-hidden`}
                >
                  {/* Step number background */}
                  <div className="absolute top-4 right-5 text-[80px] font-black text-slate-800/40 leading-none select-none pointer-events-none">
                    {item.step}
                  </div>

                  <div className={`w-12 h-12 rounded-xl border ${item.borderColor} bg-slate-900/60 flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.accentColor}`} />
                  </div>

                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${item.accentColor} mb-2`}>Step {item.step}</div>
                    <h3 className="text-xl font-bold text-slate-100 mb-3">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS SECTION — mirrored layout ────────────────────── */}
      <section className="py-28 px-6 border-t border-slate-800/40 relative">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            {/* Left — copy */}
            <motion.div variants={fadeUp}>
              <SectionLabel text="Adaptive Skill Engine" color="text-emerald-400" />
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                Your learning adapts to{" "}
                <span className="gradient-text-green">your weaknesses</span>
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                CyberQuest tracks 9 cybersecurity skill domains continuously. Every investigation
                updates your mastery score. The AI recommends missions that target your exact gaps —
                not a generic curriculum.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {["Phishing & Social Engineering", "Incident Response", "Network Forensics", "Authentication & IAM", "IOC Analysis"].map(skill => (
                  <div key={skill} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {skill}
                  </div>
                ))}
              </div>
              <Link
                href="/sign-up"
                className="btn-tactical inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 text-slate-900 font-black hover:bg-emerald-400 transition-colors glow-green"
              >
                Start Learning Free
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Right — skill profile widget */}
            <motion.div variants={fadeUp}>
              <div className="glass-card p-7 rounded-2xl relative">
                {/* Corner HUD brackets */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-cyan-500/30" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-cyan-500/30" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-cyan-500/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-cyan-500/30" />

                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Sample Skill Profile</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                    Live tracking
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { skill: "Phishing Detection", value: 86, color: "from-emerald-500 to-emerald-400" },
                    { skill: "IOC Analysis", value: 73, color: "from-cyan-500 to-cyan-400" },
                    { skill: "Web Security", value: 62, color: "from-yellow-500 to-yellow-400" },
                    { skill: "Incident Response", value: 55, color: "from-orange-500 to-orange-400" },
                    { skill: "Authentication", value: 41, color: "from-red-500 to-red-400" },
                    { skill: "Cryptography", value: 28, color: "from-red-600 to-red-500" },
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{item.skill}</span>
                      <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-8 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-purple-500/8 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Insight</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your <span className="text-red-400">authentication skills (41%)</span> are your biggest gap relative to your phishing detection strength. Recommended:{" "}
                    <span className="text-purple-300 font-semibold">&quot;Credential Stuffing Investigation&quot;</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA — centred, symmetrical ────────────────────── */}
      <section className="py-28 px-6 border-t border-slate-800/40 relative overflow-hidden">
        {/* Full-bleed background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 cyber-grid opacity-20" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl mx-auto text-center relative"
        >
          <motion.div variants={fadeUp} className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mx-auto mb-10 glow-cyan">
            <Shield className="w-10 h-10 text-cyan-400" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <SectionLabel text="Mission Briefing" />
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Ready to investigate?
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-4 max-w-2xl mx-auto">
            Start with <span className="text-cyan-400 font-semibold">Mission 01: The Compromised Employee</span>. A senior finance analyst&apos;s account has been breached.
          </motion.p>

          <motion.p variants={fadeUp} className="text-sm text-slate-600 mb-10 font-mono">
            Can you trace the attack vector before the threat actor moves laterally?
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="btn-tactical group inline-flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-cyan-500 text-slate-900 font-black text-lg hover:bg-cyan-400 transition-all glow-cyan"
            >
              <Crosshair className="w-5 h-5" />
              Begin the Investigation
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="btn-tactical inline-flex items-center justify-center gap-2 px-12 py-5 rounded-2xl border border-slate-700/60 text-slate-400 font-semibold text-lg hover:border-slate-600 transition-all"
            >
              Already have an account?
            </Link>
          </motion.div>

          {/* Bottom trust row */}
          <motion.div variants={fadeUp} className="flex justify-center gap-8 mt-12 text-xs text-slate-700">
            {["Free to start", "No credit card required", "All scenarios are simulated"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 text-slate-600 text-sm">
            <Shield className="w-4 h-4 text-cyan-400/50" />
            <span>CyberQuest AI</span>
            <span className="text-slate-800">—</span>
            <span className="font-mono text-[11px]">v0.1.0-hackathon</span>
          </div>
          <p className="text-slate-700 text-xs font-mono">
            ⚠ ALL SCENARIOS ARE SIMULATED. NO REAL INFRASTRUCTURE TARGETED.
          </p>
        </div>
      </footer>
    </div>
  );
}
