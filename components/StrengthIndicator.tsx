import React from "react";
import { StrengthScore } from "@/lib/types";

interface StrengthIndicatorProps {
  score?: StrengthScore | null;
  reason?: string;
  compact?: boolean;
}

export function StrengthIndicator({ score, reason, compact = false }: StrengthIndicatorProps) {
  if (!score) {
    return (
      <span className="text-micro text-ink-muted font-medium">
        Evaluating…
      </span>
    );
  }

  const normalized = score.toUpperCase() as StrengthScore;

  if (normalized === "STRONG") {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="inline-flex items-center gap-1.5 text-micro font-semibold text-emerald-700">
          <span className="flex gap-0.5 text-emerald-500">●●●●</span>
          <span>STRONG</span>
        </div>
        {!compact && reason && (
          <p className="text-[11px] text-ink-muted leading-tight">{reason}</p>
        )}
      </div>
    );
  }

  if (normalized === "MODERATE") {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="inline-flex items-center gap-1.5 text-micro font-semibold text-amber-700">
          <span className="flex gap-0.5">
            <span className="text-amber-500">●●</span>
            <span className="text-rule-hairline">○○</span>
          </span>
          <span>MODERATE</span>
        </div>
        {!compact && reason && (
          <p className="text-[11px] text-ink-muted leading-tight">{reason}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-1.5 text-micro font-semibold text-rose-700">
        <span className="flex gap-0.5">
          <span className="text-rose-500">●</span>
          <span className="text-rule-hairline">○○○</span>
        </span>
        <span>WEAK</span>
      </div>
      {!compact && reason && (
        <p className="text-[11px] text-ink-muted leading-tight">{reason}</p>
      )}
    </div>
  );
}

