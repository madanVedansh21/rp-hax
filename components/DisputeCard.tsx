"use client";

import React from "react";
import Link from "next/link";
import { Dispute } from "@/lib/types";
import { DeadlineBadge } from "./DeadlineBadge";
import { StrengthIndicator } from "./StrengthIndicator";
import {
  ArrowRight,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const formattedAmount = `₹${(dispute.amount / 100).toLocaleString("en-IN")}`;
  const isAgentWorking = dispute.status === "pending" || dispute.status === "in_progress";
  const isSubmitted = dispute.status === "submitted";

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "fraud":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      case "not_received":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "duplicate":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Payment & Dispute Identifiers */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {isSubmitted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : isAgentWorking ? (
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {dispute.payment_id}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {formattedAmount}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${getReasonBadge(
                  dispute.reason_code
                )}`}
              >
                {dispute.reason_code.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Dispute: {dispute.dispute_id}</span>
              {dispute.order_id && (
                <>
                  <span>•</span>
                  <span>Order: {dispute.order_id}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Evidence Strength & Deadline */}
        <div className="flex items-center gap-6 sm:self-center">
          <div className="min-w-[130px]">
            {isAgentWorking ? (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Gathering MCP evidence...</span>
              </div>
            ) : (
              <StrengthIndicator score={dispute.strength_score} compact />
            )}
          </div>

          <div>
            <DeadlineBadge respondBy={dispute.respond_by} status={dispute.status} />
          </div>

          <Link
            href={`/dispute/${dispute.dispute_id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span>{isSubmitted ? "View Package" : "Review & Submit"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
