import React from "react";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";

interface DeadlineBadgeProps {
  respondBy: string;
  status?: string;
  className?: string;
}

export function DeadlineBadge({ respondBy, status, className = "" }: DeadlineBadgeProps) {
  if (status === "submitted") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        Submitted
      </span>
    );
  }

  const deadline = new Date(respondBy).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffHours / 24);

  if (diffMs <= 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5" />
        Expired
      </span>
    );
  }

  if (diffHours <= 48) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        {diffHours <= 24 ? `${diffHours}h left` : `${diffDays}d left`}
      </span>
    );
  }

  if (diffDays <= 5) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        {diffDays}d left
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-medium bg-surface-stone text-ink-muted border border-rule-hairline ${className}`}>
      <Clock className="w-3.5 h-3.5" />
      {diffDays}d left
    </span>
  );
}

