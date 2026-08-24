"use client";

import React, { useState } from "react";
import { AgentLog } from "@/lib/types";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  Zap,
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
        return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
      case "FAILED":
        return "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";
      case "SKIPPED":
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
      default:
        return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Agent Execution Audit Trail
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono font-medium">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Total execution: {(totalDurationMs / 1000).toFixed(2)}s</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Logs Content */}
      {isOpen && (
        <div className="p-4 space-y-1.5 bg-slate-950 text-slate-200 font-mono text-xs max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500 py-3 text-center text-xs">
              No audit logs recorded for this dispute yet.
            </div>
          ) : (
            logs.map((item, idx) => {
              const isDetailsOpen = expandedIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded hover:bg-slate-900/90 transition-colors p-1.5 border border-transparent hover:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        {formatTime(item.created_at)}
                      </span>
                      <span className="font-bold text-blue-400 text-xs">
                        {item.action}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getStatusBadge(
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
                          className="text-slate-400 hover:text-white text-[10px] underline"
                        >
                          {isDetailsOpen ? "hide payload" : "view payload"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isDetailsOpen && item.detail && (
                    <pre className="mt-2 p-2 rounded bg-slate-900 text-emerald-400 text-[11px] overflow-x-auto border border-slate-800">
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
