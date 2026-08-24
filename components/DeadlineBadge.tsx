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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${className}`}>
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
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5" />
        Deadline Expired
      </span>
    );
  }

  if (diffHours <= 48) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        {diffHours <= 24 ? `${diffHours} hours left` : `${diffDays} days left`} ⚠️
      </span>
    );
  }

  if (diffDays <= 5) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        {diffDays} days left
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      {diffDays} days left
    </span>
  );
}
