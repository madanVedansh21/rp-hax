import React from "react";
import { StrengthScore } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface StrengthIndicatorProps {
  score?: StrengthScore | null;
  reason?: string;
  compact?: boolean;
}

export function StrengthIndicator({ score, reason, compact = false }: StrengthIndicatorProps) {
  if (!score) {
    return (
      <span className="text-xs text-slate-400 font-medium">
        Evaluating...
      </span>
    );
  }

  const normalized = score.toUpperCase() as StrengthScore;

  if (normalized === "STRONG") {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="flex gap-0.5 text-emerald-600">●●●●</span>
          <span>STRONG Evidence</span>
        </div>
        {!compact && reason && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{reason}</p>
        )}
      </div>
    );
  }

  if (normalized === "MODERATE") {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="flex gap-0.5">
            <span className="text-amber-500">●●</span>
            <span className="text-slate-300 dark:text-slate-600">○○</span>
          </span>
          <span>MODERATE Evidence</span>
        </div>
        {!compact && reason && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{reason}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
        <span className="flex gap-0.5">
          <span className="text-rose-500">●</span>
          <span className="text-slate-300 dark:text-slate-600">○○○</span>
        </span>
        <span>WEAK Evidence</span>
      </div>
      {!compact && reason && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{reason}</p>
      )}
    </div>
  );
}
