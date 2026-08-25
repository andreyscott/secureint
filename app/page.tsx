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
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080b12] text-slate-200 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-[#080b12]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Cyber<span className="text-cyan-400">Quest</span>{" "}
              <span className="text-slate-400 font-normal text-sm">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 cyber-grid opacity-40" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
              AI-Powered Cybersecurity Learning
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Cybersecurity isn&apos;t{" "}
              <span className="text-slate-500">memorization.</span>
              <br />
              It&apos;s{" "}
              <span className="gradient-text">investigation.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              CyberQuest AI turns cybersecurity learning into interactive
              incident-response missions that adapt to the way you think. No
              lectures. No quizzes. Real investigations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 text-slate-900 font-bold text-lg hover:bg-cyan-400 transition-all duration-200 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              >
                Start Your First Mission
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-lg hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
              >
                Explore How It Works
              </a>
            </div>
          </motion.div>

          {/* SOC Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="mx-4 flex-1 h-6 rounded bg-slate-800 flex items-center px-3">
                  <Lock className="w-3 h-3 text-green-400 mr-2" />
                  <span className="text-xs text-slate-500">
                    cyberquest.ai/missions/compromised-employee/investigate
                  </span>
                </div>
              </div>

              {/* Investigation workspace preview */}
              <div className="grid grid-cols-4 h-[360px] text-xs">
                {/* Evidence sidebar */}
                <div className="col-span-1 border-r border-slate-800 bg-slate-950/50 p-3 flex flex-col gap-2">
                  <div className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold mb-1 px-1">
                    Evidence (5)
                  </div>
                  {[
                    { icon: Mail, label: "Suspicious Email", color: "text-blue-400", active: true },
                    { icon: ShieldAlert, label: "Auth Logs", color: "text-red-400" },
                    { icon: Globe, label: "DNS Records", color: "text-purple-400" },
                    { icon: Activity, label: "EDR Alert", color: "text-yellow-400" },
                    { icon: Network, label: "Firewall Logs", color: "text-orange-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                        item.active
                          ? "bg-cyan-500/10 border border-cyan-500/30"
                          : "hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className={item.active ? "text-cyan-300" : "text-slate-400"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Evidence viewer */}
                <div className="col-span-2 border-r border-slate-800 p-4 font-mono">
                  <div className="text-slate-500 uppercase tracking-wider text-[10px] font-sans mb-3">
                    Email Evidence
                  </div>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-12">FROM</span>
                      <span className="text-red-400">
                        security@micros<span className="bg-red-400/20 px-0.5 rounded">0</span>ft-support.example
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-12">TO</span>
                      <span className="text-slate-300">m.webb@acmegroup.internal</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-500 w-12">SUBJ</span>
                      <span className="text-slate-300">🔒 Urgent: Unusual sign-in activity...</span>
                    </div>
                    <div className="mt-3 p-2 bg-slate-900/80 rounded border border-slate-800 space-y-1 text-[10px] text-slate-400">
                      <p>Dear Marcus Webb,</p>
                      <p>We have detected unusual sign-in activity on your Microsoft 365 account...</p>
                      <p className="text-cyan-400">▶ VERIFY MY ACCOUNT NOW</p>
                      <p className="text-red-400 text-[9px]">
                        → login-micros0ft-support.example/verify
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-[9px]">
                        SPF FAIL — DKIM mismatch — Typosquatting domain
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI panel */}
                <div className="col-span-1 bg-slate-950/80 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                    <Brain className="w-3 h-3 text-purple-400" />
                    AI Analyst
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-slate-300">
                      What specific element of the sender address makes this suspicious?
                    </div>
                    <div className="p-2 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-400">
                      &quot;The zero instead of the letter o?&quot;
                    </div>
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-slate-300">
                      Exactly. This is typosquatting. What other headers should you check?
                    </div>
                  </div>
                  <div className="p-1.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-600">
                    Ask the AI analyst...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp}>
              <div className="text-sm text-red-400 uppercase tracking-wider font-semibold mb-4">
                The Problem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Traditional security training doesn&apos;t prepare you for real incidents
              </h2>
              <div className="space-y-4 text-slate-400">
                <p>
                  Most cybersecurity courses teach concepts through lectures and
                  multiple-choice quizzes. You can memorize the definition of a
                  phishing attack without ever being able to detect one.
                </p>
                <p>
                  Real security analysts don&apos;t memorize — they investigate. They
                  correlate evidence, form hypotheses, and make decisions under
                  pressure. That skill takes practice, not memorization.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
              {[
                { icon: Search, label: "No real investigation practice" },
                { icon: Brain, label: "AI doesn't explain reasoning" },
                { icon: Target, label: "Generic content for all learners" },
                { icon: TrendingUp, label: "No adaptive skill tracking" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col gap-3"
                >
                  <item.icon className="w-6 h-6 text-red-400" />
                  <p className="text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-sm text-cyan-400 uppercase tracking-wider font-semibold mb-4">
              How CyberQuest Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              The investigation learning loop
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Eye,
                title: "Investigate a Realistic Incident",
                description:
                  "You're placed inside a real cybersecurity scenario. Analyze emails, authentication logs, DNS records, firewall logs, and EDR alerts to piece together what happened.",
                color: "text-cyan-400",
                border: "border-cyan-500/20",
                bg: "bg-cyan-500/5",
              },
              {
                step: "02",
                icon: Brain,
                title: "Reason with an AI Socratic Tutor",
                description:
                  "Your AI analyst never reveals the answer. It asks focused questions to help you reason through the evidence, detect misconceptions, and build genuine understanding.",
                color: "text-purple-400",
                border: "border-purple-500/20",
                bg: "bg-purple-500/5",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Get Personalized AI Feedback",
                description:
                  "After submission, AI evaluates your entire investigation — not just the final answer. It detects misconceptions, updates your skill profile, and recommends your next mission.",
                color: "text-emerald-400",
                border: "border-emerald-500/20",
                bg: "bg-emerald-500/5",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border ${item.border} ${item.bg} flex flex-col gap-5`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-slate-700">
                    {item.step}
                  </span>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm text-emerald-400 uppercase tracking-wider font-semibold mb-4">
                Personalized Skills
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your learning adapts to your weaknesses
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                CyberQuest tracks 9 cybersecurity skill domains. Every
                investigation updates your mastery score. The system recommends
                missions targeting exactly what you need most.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors"
              >
                Start learning free
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50"
            >
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Sample Skill Profile
              </div>
              <div className="space-y-3">
                {[
                  { skill: "Phishing Detection", value: 86, color: "bg-emerald-500" },
                  { skill: "IOC Analysis", value: 73, color: "bg-cyan-500" },
                  { skill: "Web Security", value: 62, color: "bg-yellow-500" },
                  { skill: "Incident Response", value: 55, color: "bg-orange-500" },
                  { skill: "Authentication", value: 41, color: "bg-red-500" },
                  { skill: "Cryptography", value: 38, color: "bg-red-600" },
                ].map((item) => (
                  <div key={item.skill} className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-40">{item.skill}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                    <span className="text-sm font-mono text-slate-400 w-10 text-right">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-300">
                  <span className="font-semibold">AI Insight:</span> Your
                  authentication analysis skills are significantly below your
                  phishing detection. Recommended: &quot;Credential Stuffing
                  Investigation.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to investigate?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start with Mission 01: The Compromised Employee. A senior finance
            analyst&apos;s account has been compromised. Can you trace the attack?
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-cyan-500 text-slate-900 font-bold text-xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
          >
            Begin the Investigation
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>CyberQuest AI — Hackathon MVP</span>
          </div>
          <p className="text-slate-600 text-sm">
            All scenarios are simulated. No real infrastructure targeted.
          </p>
        </div>
      </footer>
    </div>
  );
}
