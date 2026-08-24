"use client";

import React, { useState } from "react";
import { AgentLog } from "@/lib/types";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface AgentLogViewerProps {
  logs: AgentLog[];
}

export function AgentLogViewer({ logs }: AgentLogViewerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalDurationMs = logs.reduce((acc, l) => acc + (l.duration_ms || 0), 0);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-emerald-700 bg-surface-pale-green border-emerald-200";
      case "FAILED":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "SKIPPED":
        return "text-ink-muted bg-surface-stone border-rule-hairline";
      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="bg-surface-canvas border border-rule-hairline rounded-sm overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-surface-stone/40 border-b border-rule-hairline flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-ink" />
          <span className="mono-label text-[12px] font-semibold text-ink">
            Agent Execution Audit Trail
          </span>
          <span className="mono-label text-[10px] px-2.5 py-0.5 rounded-full bg-surface-canvas border border-rule-hairline text-ink-muted">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[11px] text-ink-muted flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Total execution: {(totalDurationMs / 1000).toFixed(2)}s</span>
          </div>
          <button className="text-ink-muted hover:text-ink">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Logs Content — near-black dark product terminal environment */}
      {isOpen && (
        <div className="p-4 space-y-1 bg-brand-nearblack text-slate-200 font-mono text-micro max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-ink-muted py-4 text-center text-caption">
              No audit logs recorded for this dispute yet.
            </div>
          ) : (
            logs.map((item, idx) => {
              const isDetailsOpen = expandedIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xs hover:bg-white/5 transition-colors p-2 border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        {formatTime(item.created_at)}
                      </span>
                      <span className="font-semibold text-brand-blue text-micro">
                        {item.action}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.duration_ms !== undefined && item.duration_ms > 0 && (
                        <span className="text-slate-400 text-[11px]">
                          {item.duration_ms}ms
                        </span>
                      )}
                      {item.detail && Object.keys(item.detail).length > 0 && (
                        <button
                          onClick={() => setExpandedIndex(isDetailsOpen ? null : idx)}
                          className="text-slate-400 hover:text-white text-[10px] underline underline-offset-2"
                        >
                          {isDetailsOpen ? "hide payload" : "view payload"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isDetailsOpen && item.detail && (
                    <pre className="mt-2 p-2.5 rounded-xs bg-black/50 text-emerald-400 text-[11px] overflow-x-auto border border-white/10">
                      {JSON.stringify(item.detail, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}



