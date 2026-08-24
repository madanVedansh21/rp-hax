"use client";

import React from "react";
import Link from "next/link";
import { Dispute } from "@/lib/types";
import { DeadlineBadge } from "./DeadlineBadge";
import { StrengthIndicator } from "./StrengthIndicator";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const formattedAmount = `₹${(dispute.amount / 100).toLocaleString("en-IN")}`;
  const isAgentWorking = dispute.status === "pending" || dispute.status === "in_progress";
  const isSubmitted = dispute.status === "submitted";

  const getReasonChip = (reason: string) => {
    switch (reason) {
      case "fraud":
        return "border-rose-400 text-rose-700 bg-rose-50";
      case "not_received":
        return "border-amber-400 text-amber-700 bg-amber-50";
      case "duplicate":
        return "border-brand-blue text-brand-blue bg-surface-pale-blue";
      default:
        return "border-rule-hairline text-ink-muted bg-surface-stone";
    }
  };

  return (
    <div className="bg-surface-canvas px-6 py-5 hover:bg-surface-stone/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Left: identifiers */}
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div className="w-8 h-8 rounded-xs bg-surface-stone border border-rule-hairline flex items-center justify-center shrink-0">
            {isSubmitted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isAgentWorking ? (
              <Clock className="w-4 h-4 text-brand-blue animate-spin" />
            ) : (
              <Shield className="w-4 h-4 text-ink-muted" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-ink text-[14px] tracking-tight">
                {dispute.payment_id}
              </span>
              <span className="font-display font-semibold text-[16px] text-ink">
                {formattedAmount}
              </span>
              {/* Reason chip — coral/blue outlined pill */}
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${getReasonChip(
                  dispute.reason_code
                )}`}
              >
                {dispute.reason_code.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-micro text-ink-muted">
              <span>{dispute.dispute_id}</span>
              {dispute.order_id && (
                <>
                  <span className="text-rule-hairline">·</span>
                  <span>Order: {dispute.order_id}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: strength, deadline, action */}
        <div className="flex items-center gap-5 sm:self-center">
          <div className="min-w-[120px]">
            {isAgentWorking ? (
              <div className="flex items-center gap-1.5 text-micro text-brand-blue font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping" />
                <span>Gathering evidence…</span>
              </div>
            ) : (
              <StrengthIndicator score={dispute.strength_score} compact />
            )}
          </div>

          <DeadlineBadge respondBy={dispute.respond_by} status={dispute.status} />

          <Link
            href={`/dispute/${dispute.dispute_id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>{isSubmitted ? "View Package" : "Review & Submit"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


