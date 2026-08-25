"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldAlert,
  Globe,
  Network,
  Monitor,
  Brain,
  Send,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  CheckCircle,
  FileText,
  Shield,
} from "lucide-react";
import { cn, getEvidenceTypeColor, formatTime } from "@/lib/utils";
import EvidenceViewer from "./EvidenceViewer";
import { useRouter } from "next/navigation";

interface Evidence {
  id: string;
  type: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  order: number;
  isKey: boolean;
}

interface Question {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
  order: number;
}

interface AIMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

interface Action {
  id: string;
  action: string;
  targetId: string | null;
  createdAt: string;
}

interface MissionData {
  id: string;
  slug: string;
  title: string;
  briefing: string;
  difficulty: string;
  evidence: Evidence[];
  questions: Question[];
  objectives: Array<{ id: string; skill: string; description: string }>;
}

interface AttemptData {
  id: string;
  startedAt: string;
  actions: Action[];
  aiMessages: AIMessage[];
}

interface Props {
  mission: MissionData;
  attempt: AttemptData;
  userId: string;
}

const EVIDENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  AUTH_LOG: ShieldAlert,
  DNS: Globe,
  FIREWALL: Network,
  EDR: Monitor,
  NETWORK: Network,
  FILE: FileText,
};

type Phase = "investigating" | "submitting" | "submitting_loading";

export default function InvestigationWorkspace({ mission, attempt }: Props) {
  const router = useRouter();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [viewedEvidence, setViewedEvidence] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("investigating");
  const [actions, setActions] = useState<Action[]>(attempt.actions);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(attempt.aiMessages);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalReasoning, setFinalReasoning] = useState("");
  const [attackVector, setAttackVector] = useState("");
  const [recommendedResponse, setRecommendedResponse] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll AI chat
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // Record action helper
  const recordAction = useCallback(async (
    action: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const res = await fetch("/api/missions/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, action, targetId, metadata }),
      });
      if (res.ok) {
        const newAction: Action = {
          id: Date.now().toString(),
          action,
          targetId: targetId ?? null,
          createdAt: new Date().toISOString(),
        };
        setActions((prev) => [...prev, newAction]);
      }
    } catch {
      // Silently fail action recording — don't interrupt investigation
    }
  }, [attempt.id]);

  // View evidence
  const handleViewEvidence = useCallback((ev: Evidence) => {
    setSelectedEvidence(ev);
    if (!viewedEvidence.has(ev.id)) {
      setViewedEvidence((prev) => new Set([...prev, ev.id]));
      recordAction("VIEW_EVIDENCE", ev.id, { evidenceType: ev.type, evidenceTitle: ev.title });
    }
  }, [viewedEvidence, recordAction]);

  // Send AI message
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput.trim();
    setAiInput("");
    setAiLoading(true);

    // Optimistic update
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          attemptId: attempt.id,
          missionSlug: mission.slug,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMsg: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        setAiMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: AIMessage = {
          id: `error-${Date.now()}`,
          role: "ASSISTANT",
          content: data.error ?? "I'm having trouble responding. Please try again.",
          createdAt: new Date().toISOString(),
        };
        setAiMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: AIMessage = {
        id: `error-${Date.now()}`,
        role: "ASSISTANT",
        content: "Connection error. Please check your internet and try again.",
        createdAt: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit investigation
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);

    await recordAction("SUBMIT_ACTION", undefined, {
      attackVector,
      answerCount: Object.keys(answers).length,
    });

    try {
      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers: mission.questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] ?? "",
            reasoning: undefined,
          })),
          finalReasoning,
          attackVector,
          recommendedResponse,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/missions/${mission.slug}/results?attempt=${attempt.id}`);
      } else {
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        setSubmitLoading(false);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitLoading(false);
    }
  };

  const evidenceProgress = Math.round((viewedEvidence.size / mission.evidence.length) * 100);
  const canSubmit = attackVector.trim().length > 0 && finalReasoning.trim().length >= 10 && recommendedResponse.trim().length >= 10;

  return (
    <div className="h-screen flex flex-col bg-[#080b12] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 h-12 border-b border-slate-800/70 bg-slate-900/50 flex items-center px-4 gap-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
          <span className="text-xs font-mono text-slate-400">INCIDENT ACTIVE</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-semibold text-slate-300">{mission.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Evidence: {viewedEvidence.size}/{mission.evidence.length}
          </span>
          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${evidenceProgress}%` }}
            />
          </div>
          {phase === "investigating" && (
            <button
              onClick={() => {
                setPhase("submitting");
                recordAction("SUBMIT_HYPOTHESIS");
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors"
            >
              Submit Findings
            </button>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Evidence navigation */}
        <div className="w-56 flex-shrink-0 border-r border-slate-800/70 bg-slate-950/50 flex flex-col overflow-y-auto">
          <div className="p-3 border-b border-slate-800/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Evidence ({mission.evidence.length})
            </p>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {mission.evidence.map((ev) => {
              const Icon = EVIDENCE_ICONS[ev.type] ?? FileText;
              const colorClass = getEvidenceTypeColor(ev.type);
              const isViewed = viewedEvidence.has(ev.id);
              const isSelected = selectedEvidence?.id === ev.id;

              return (
                <button
                  key={ev.id}
                  onClick={() => handleViewEvidence(ev)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all duration-200",
                    isSelected
                      ? "border-cyan-500/40 bg-cyan-500/8"
                      : isViewed
                      ? "border-slate-700/50 bg-slate-800/30"
                      : "border-transparent hover:border-slate-700/50 hover:bg-slate-800/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", colorClass.split(" ")[0])} />
                    <div className="min-w-0">
                      <p className={cn(
                        "text-xs font-medium leading-tight",
                        isSelected ? "text-cyan-300" : isViewed ? "text-slate-300" : "text-slate-400"
                      )}>
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{ev.type}</p>
                    </div>
                    {isViewed && !isSelected && (
                      <CheckCircle className="w-3 h-3 text-emerald-500/60 flex-shrink-0 ml-auto mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Timeline summary */}
          <div className="border-t border-slate-800/50 p-3" ref={timelineScrollRef}>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
              Timeline
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {actions.slice(-8).map((action) => (
                <div key={action.id} className="flex items-start gap-1.5">
                  <span className="text-[9px] font-mono text-slate-600 flex-shrink-0 mt-0.5">
                    {formatTime(action.createdAt)}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    {action.action.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Evidence viewer or submission form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {phase === "investigating" ? (
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedEvidence ? (
                  <motion.div
                    key={selectedEvidence.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full p-6"
                  >
                    <EvidenceViewer evidence={selectedEvidence} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center text-center p-8"
                  >
                    <div>
                      <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-500 mb-2">
                        Select evidence to begin investigation
                      </h3>
                      <p className="text-sm text-slate-600 max-w-xs">
                        Choose an evidence item from the left panel. Examine all available evidence before submitting your findings.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Submission form */
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-100 mb-1">
                    Submit Investigation Findings
                  </h2>
                  <p className="text-sm text-slate-400">
                    Based on your investigation, provide your conclusions below. The AI evaluator will analyze your reasoning.
                  </p>
                </div>

                {/* Multiple choice questions */}
                {mission.questions.map((q) => (
                  <div key={q.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                    <p className="text-sm font-semibold text-slate-200 mb-3">
                      {q.question}
                    </p>
                    {q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border text-sm transition-all",
                              answers[q.id] === opt
                                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                                : "border-slate-700 hover:border-slate-600 text-slate-400"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Attack vector */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    What was the attack vector?
                  </label>
                  <input
                    value={attackVector}
                    onChange={(e) => setAttackVector(e.target.value)}
                    placeholder="e.g., Phishing email leading to credential harvesting..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600"
                  />
                </div>

                {/* Final reasoning */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    Explain your reasoning
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Walk through the evidence chain you identified. What evidence led to your conclusions?
                  </p>
                  <textarea
                    value={finalReasoning}
                    onChange={(e) => setFinalReasoning(e.target.value)}
                    placeholder="Trace the evidence chain: e.g., The phishing email at 08:41 UTC from security@micros0ft-support.example triggered a DNS query to the credential harvesting domain. The EDR alert confirmed credential submission..."
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600 resize-none"
                  />
                </div>

                {/* Recommended response */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    What should the SOC do first?
                  </label>
                  <textarea
                    value={recommendedResponse}
                    onChange={(e) => setRecommendedResponse(e.target.value)}
                    placeholder="Describe the immediate containment action and subsequent steps..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPhase("investigating")}
                    className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:border-slate-600 transition-colors"
                  >
                    ← Back to Evidence
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitLoading}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                      canSubmit && !submitLoading
                        ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI is evaluating your investigation...
                      </>
                    ) : (
                      <>
                        Submit for AI Evaluation
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* RIGHT: AI Analyst Panel */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800/70 bg-slate-950/50 flex flex-col">
          {/* AI Header */}
          <div className="flex-shrink-0 p-3 border-b border-slate-800/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-3 h-3 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">AI Analyst</p>
              <p className="text-[10px] text-slate-500">Socratic tutor mode</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 pulse-dot" />
            </div>
          </div>

          {/* Messages */}
          <div
            ref={aiScrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
          >
            {aiMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 text-xs text-slate-300 leading-relaxed"
              >
                <p>
                  I&apos;m your AI analyst. I can help you reason through the evidence without revealing the answer.
                </p>
                <p className="mt-2 text-slate-500">
                  Start investigating the evidence, then ask me questions about what you find.
                </p>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {aiMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-3 rounded-lg text-xs leading-relaxed",
                    msg.role === "ASSISTANT"
                      ? "border border-purple-500/20 bg-purple-500/5 text-slate-300"
                      : "border border-slate-700/50 bg-slate-800/50 text-slate-400 ml-3"
                  )}
                >
                  {msg.role === "ASSISTANT" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Brain className="w-2.5 h-2.5 text-purple-400" />
                      <span className="text-[10px] text-purple-400 font-semibold">AI Analyst</span>
                    </div>
                  )}
                  {msg.content}
                </motion.div>
              ))}
              {aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 flex items-center gap-2 text-xs text-slate-400"
                >
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                  Analyzing...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-slate-800/50">
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSend();
                  }
                }}
                placeholder="Ask the AI analyst..."
                disabled={aiLoading}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 placeholder-slate-600 disabled:opacity-50"
              />
              <button
                onClick={handleAiSend}
                disabled={!aiInput.trim() || aiLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick prompts */}
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                "What's suspicious here?",
                "What should I look at next?",
                "Explain this indicator",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setAiInput(prompt)}
                  className="text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-500 hover:text-slate-400 hover:border-slate-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: objectives strip */}
      <div className="flex-shrink-0 h-8 border-t border-slate-800/50 bg-slate-950/70 flex items-center px-4 gap-6 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] text-slate-600 font-mono">
            {new Date().toISOString().substring(11, 16)} UTC
          </span>
        </div>
        {mission.objectives.map((obj) => (
          <div key={obj.id} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-[10px] text-slate-600">{obj.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
