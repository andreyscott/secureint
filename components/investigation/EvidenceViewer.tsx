"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Mail, Shield } from "lucide-react";
import { cn, getEvidenceTypeColor } from "@/lib/utils";

interface Evidence {
  id: string;
  type: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  isKey: boolean;
}

interface Props {
  evidence: Evidence;
}

export default function EvidenceViewer({ evidence }: Props) {
  const colorClass = getEvidenceTypeColor(evidence.type);

  return (
    <motion.div
      key={evidence.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", colorClass)}>
              {evidence.type.replace("_", " ")}
            </span>
            {evidence.isKey && (
              <span className="text-xs px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-semibold">
                KEY EVIDENCE
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-100">{evidence.title}</h2>
          <p className="text-sm text-slate-400 mt-1">{evidence.description}</p>
        </div>
      </div>

      {/* Evidence-type specific renderer */}
      {evidence.type === "EMAIL" && <EmailRenderer content={evidence.content} />}
      {evidence.type === "AUTH_LOG" && <AuthLogRenderer content={evidence.content} />}
      {evidence.type === "DNS" && <DNSRenderer content={evidence.content} />}
      {evidence.type === "EDR" && <EDRRenderer content={evidence.content} />}
      {evidence.type === "FIREWALL" && <FirewallRenderer content={evidence.content} />}
      {!["EMAIL", "AUTH_LOG", "DNS", "EDR", "FIREWALL"].includes(evidence.type) && (
        <GenericRenderer content={evidence.content} />
      )}
    </motion.div>
  );
}

// ============================================================
// EMAIL RENDERER
// ============================================================

function EmailRenderer({ content }: { content: Record<string, unknown> }) {
  const from = content.from as { name: string; address: string } | undefined;
  const to = content.to as Array<{ name: string; address: string }> | undefined;
  const subject = content.subject as string | undefined;
  const timestamp = content.timestamp as string | undefined;
  const body = content.body as string | undefined;
  const headers = content.headers as Record<string, string> | undefined;
  const links = content.links as Array<{ text: string; url: string; suspicious: boolean }> | undefined;
  const indicators = content.phishingIndicators as string[] | undefined;

  return (
    <div className="space-y-4">
      {/* Email header */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 font-mono text-xs space-y-2">
        <div className="flex gap-3">
          <span className="text-slate-500 w-16 flex-shrink-0">FROM</span>
          <span className={cn(
            from?.address.includes("micros0ft") || from?.address.includes("support.example")
              ? "text-red-400"
              : "text-slate-300"
          )}>
            {from?.name} &lt;{from?.address}&gt;
          </span>
          {(from?.address.includes("micros0ft") || from?.address.includes("support.example")) && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500 w-16 flex-shrink-0">TO</span>
          <span className="text-slate-300">{to?.map(t => t.address).join(", ")}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500 w-16 flex-shrink-0">SUBJECT</span>
          <span className="text-slate-300">{subject}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500 w-16 flex-shrink-0">DATE</span>
          <span className="text-slate-400">{timestamp ? new Date(timestamp).toUTCString() : ""}</span>
        </div>
      </div>

      {/* Headers analysis */}
      {headers && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Email Headers (Security Analysis)</p>
          <div className="space-y-1.5 font-mono text-xs">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <span className="text-slate-600 w-40 flex-shrink-0 truncate">{key}</span>
                <span className={cn(
                  value.includes("FAIL") || value.includes("mismatch")
                    ? "text-red-400"
                    : "text-slate-400"
                )}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email body */}
      {body && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Body
          </p>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {body}
          </pre>
        </div>
      )}

      {/* Suspicious links */}
      {links && links.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Embedded Links</p>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className={cn(
                "flex items-start gap-3 p-3 rounded-lg border text-xs font-mono",
                link.suspicious
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-slate-700 bg-slate-900/30"
              )}>
                <ExternalLink className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", link.suspicious ? "text-red-400" : "text-slate-500")} />
                <div>
                  <p className="text-slate-400">{link.text}</p>
                  <p className={cn("mt-0.5 break-all", link.suspicious ? "text-red-400" : "text-slate-500")}>
                    {link.url}
                  </p>
                  {link.suspicious && (
                    <p className="text-red-400/70 text-[10px] mt-1">⚠ Suspicious — does not match legitimate Microsoft domain</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phishing indicators */}
      {indicators && indicators.length > 0 && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Phishing Indicators Detected
          </p>
          <div className="space-y-2">
            {indicators.map((ind, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-red-400 flex-shrink-0">✕</span>
                <span className="text-slate-300">{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AUTH LOG RENDERER
// ============================================================

function AuthLogRenderer({ content }: { content: Record<string, unknown> }) {
  const entries = content.entries as Array<{
    timestamp: string;
    event: string;
    ip: string;
    location?: string;
    device?: string;
    mfaUsed?: boolean;
    riskScore?: number;
    riskLevel?: string;
    anomalyFlags?: string[];
    detail?: string;
  }> | undefined;

  const getRiskColor = (level?: string) => {
    if (level === "CRITICAL") return "text-red-400 bg-red-400/10 border-red-400/30";
    if (level === "HIGH") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    if (level === "MEDIUM") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 font-mono text-xs">
        <div className="flex gap-3 mb-2">
          <span className="text-slate-500">USER</span>
          <span className="text-slate-300">{content.email as string}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500">EXPORTED</span>
          <span className="text-slate-400">{content.exportedAt as string}</span>
        </div>
      </div>

      <div className="space-y-2">
        {entries?.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-xl border font-mono text-xs",
              entry.riskLevel === "CRITICAL"
                ? "border-red-500/30 bg-red-500/5"
                : "border-slate-800 bg-slate-900/30"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">
                  {new Date(entry.timestamp).toISOString().substring(11, 19)} UTC
                </span>
                <span className={cn(
                  "font-semibold",
                  entry.event === "SIGN_IN_SUCCESS" && entry.riskLevel === "CRITICAL"
                    ? "text-red-400"
                    : entry.event === "SIGN_IN_SUCCESS"
                    ? "text-emerald-400"
                    : "text-slate-300"
                )}>
                  {entry.event}
                </span>
              </div>
              {entry.riskLevel && (
                <span className={cn("text-[10px] px-2 py-0.5 rounded border", getRiskColor(entry.riskLevel))}>
                  {entry.riskLevel}
                </span>
              )}
            </div>
            {entry.ip && (
              <div className="flex gap-2 text-slate-500 text-[10px]">
                <span>IP: <span className="text-slate-400">{entry.ip}</span></span>
                {entry.location && <span>· {entry.location}</span>}
                {entry.mfaUsed !== undefined && (
                  <span className={entry.mfaUsed ? "text-emerald-400" : "text-red-400"}>
                    · MFA: {entry.mfaUsed ? "YES" : "NO"}
                  </span>
                )}
              </div>
            )}
            {entry.device && (
              <div className="text-slate-600 text-[10px] mt-0.5">Device: {entry.device}</div>
            )}
            {entry.anomalyFlags && entry.anomalyFlags.length > 0 && (
              <div className="mt-2 space-y-1">
                {entry.anomalyFlags.map((flag, fi) => (
                  <div key={fi} className="flex items-center gap-1.5 text-red-400 text-[10px]">
                    <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                    {flag}
                  </div>
                ))}
              </div>
            )}
            {entry.detail && (
              <div className="text-slate-400 text-[10px] mt-1 border-t border-slate-800/50 pt-1">
                {entry.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DNS RENDERER
// ============================================================

function DNSRenderer({ content }: { content: Record<string, unknown> }) {
  const queries = content.queries as Array<{
    timestamp: string;
    query: string;
    type: string;
    response: string;
    flag?: string | null;
  }> | undefined;

  const domainIntel = content.domainIntelligence as Record<string, Record<string, unknown>> | undefined;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 font-mono text-xs">
        <div className="flex gap-3 mb-1">
          <span className="text-slate-500">WORKSTATION</span>
          <span className="text-slate-300">{content.workstation as string}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500">PERIOD</span>
          <span className="text-slate-400">{content.period as string}</span>
        </div>
      </div>

      {/* Query table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-slate-500 pb-2 pr-4">Time</th>
              <th className="text-left text-slate-500 pb-2 pr-4">Query</th>
              <th className="text-left text-slate-500 pb-2 pr-4">Type</th>
              <th className="text-left text-slate-500 pb-2">Response</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {queries?.map((q, i) => (
              <tr key={i} className={cn(
                "border-b border-slate-800/30",
                q.flag ? "bg-red-500/5" : ""
              )}>
                <td className="py-2 pr-4 text-slate-500 text-[10px]">
                  {new Date(q.timestamp).toISOString().substring(11, 19)}
                </td>
                <td className={cn("py-2 pr-4", q.flag ? "text-red-400" : "text-slate-300")}>
                  {q.query}
                </td>
                <td className="py-2 pr-4 text-slate-500">{q.type}</td>
                <td className="py-2 text-slate-400">{q.response}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Domain intelligence */}
      {domainIntel && Object.keys(domainIntel).length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Threat Intelligence</p>
          {Object.entries(domainIntel).map(([domain, intel]) => (
            <div key={domain} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-sm font-mono text-red-400 mb-2">{domain}</p>
              <div className="space-y-1 text-xs">
                {Object.entries(intel).map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-slate-500 w-28 flex-shrink-0 capitalize">{k}</span>
                    <span className="text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EDR RENDERER
// ============================================================

function EDRRenderer({ content }: { content: Record<string, unknown> }) {
  const alert = content.alert as Record<string, unknown> | undefined;
  const timeline = content.timeline as Array<{ time: string; event: string }> | undefined;
  const recommended = content.recommendedActions as string[] | undefined;

  return (
    <div className="space-y-4">
      {/* Alert summary */}
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-bold text-red-400">ALERT: {content.alertId as string}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 font-semibold">
            {content.severity as string}
          </span>
        </div>
        <div className="font-mono text-xs space-y-1.5">
          <div className="flex gap-3">
            <span className="text-slate-500 w-24">Category</span>
            <span className="text-orange-400">{content.category as string}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-500 w-24">Technique</span>
            <span className="text-slate-300">{content.technique as string}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-500 w-24">Verdict</span>
            <span className="text-red-400">{content.verdict as string}</span>
          </div>
        </div>
      </div>

      {/* Alert details */}
      {alert && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 font-mono text-xs">
          <p className="text-slate-400 font-semibold mb-2">{alert.title as string}</p>
          <p className="text-slate-500 mb-3">{alert.description as string}</p>
          {typeof alert.targetUrl === "string" && alert.targetUrl && (
            <div className="flex gap-2 items-center p-2 bg-red-500/10 border border-red-500/20 rounded">
              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="text-red-400 break-all">{alert.targetUrl}</span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {timeline && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Event Timeline</p>
          <div className="space-y-2">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3 text-xs font-mono">
                <span className="text-slate-500 flex-shrink-0">{t.time}</span>
                <span className="text-slate-300">{t.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended actions */}
      {recommended && (
        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-xs text-yellow-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Recommended Containment Actions
          </p>
          <div className="space-y-2">
            {recommended.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-yellow-400 font-mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-slate-300">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FIREWALL RENDERER
// ============================================================

function FirewallRenderer({ content }: { content: Record<string, unknown> }) {
  const entries = content.entries as Array<{
    timestamp: string;
    action: string;
    protocol: string;
    sourceIp: string;
    destinationIp: string;
    destinationHost: string;
    bytesSent: number;
    bytesReceived: number;
    threatIntel?: string | null;
  }> | undefined;

  const ipIntel = content.ipIntelligence as Record<string, Record<string, unknown>> | undefined;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 font-mono text-xs">
        <div className="flex gap-3 mb-1">
          <span className="text-slate-500">SOURCE</span>
          <span className="text-slate-300">{content.source as string}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-500">PERIOD</span>
          <span className="text-slate-400">{content.period as string}</span>
        </div>
      </div>

      <div className="space-y-2">
        {entries?.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-xl border font-mono text-xs",
              entry.threatIntel ? "border-red-500/30 bg-red-500/5" : "border-slate-800 bg-slate-900/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-[10px]">
                {new Date(entry.timestamp).toISOString().substring(11, 19)} UTC
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border font-semibold",
                entry.action === "ALLOW"
                  ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                  : "text-red-400 border-red-400/30 bg-red-400/10"
              )}>
                {entry.action}
              </span>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex gap-2">
                <span className="text-slate-500">Proto</span>
                <span className="text-slate-400">{entry.protocol}</span>
                <span className="text-slate-500 ml-4">Bytes</span>
                <span className="text-slate-400">↑{entry.bytesSent} ↓{entry.bytesReceived}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">Dest</span>
                <span className={entry.threatIntel ? "text-red-400" : "text-slate-300"}>
                  {entry.destinationHost} ({entry.destinationIp})
                </span>
              </div>
              {entry.threatIntel && (
                <div className="flex items-center gap-1.5 text-red-400 pt-1 border-t border-red-500/20">
                  <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                  {entry.threatIntel}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* IP Intelligence */}
      {ipIntel && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">IP Intelligence</p>
          {Object.entries(ipIntel).map(([ip, intel]) => (
            <div key={ip} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 font-mono text-xs">
              <p className="text-red-400 mb-2">{ip}</p>
              <div className="space-y-1">
                {Object.entries(intel).map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-slate-500 w-24 flex-shrink-0 capitalize">{k}</span>
                    <span className={cn(
                      String(v) === "MALICIOUS" ? "text-red-400" :
                      String(v) === "SUSPICIOUS" ? "text-orange-400" :
                      "text-slate-300"
                    )}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GENERIC RENDERER
// ============================================================

function GenericRenderer({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
      <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
