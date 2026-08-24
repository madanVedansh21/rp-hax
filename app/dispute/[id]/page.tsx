"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DisputeWithDetails } from "@/lib/types";
import { Header } from "@/components/Header";
import { EvidencePanel } from "@/components/EvidencePanel";
import { DraftResponsePanel } from "@/components/DraftResponsePanel";
import { AgentLogViewer } from "@/components/AgentLogViewer";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { StrengthIndicator } from "@/components/StrengthIndicator";
import {
  ArrowLeft,
  RefreshCw,
  Play,
  AlertCircle,
} from "lucide-react";

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params?.id as string;

  const [dispute, setDispute] = useState<DisputeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputeDetails = useCallback(async () => {
    if (!disputeId) return;
    try {
      const res = await fetch(`/api/disputes/${disputeId}`);
      if (res.ok) {
        const data = await res.json();
        setDispute(data.dispute);
      } else {
        setError("Dispute not found");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dispute");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    fetchDisputeDetails();
    const interval = setInterval(() => {
      if (dispute?.status === "in_progress" || dispute?.status === "pending") {
        fetchDisputeDetails();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchDisputeDetails, dispute?.status]);

  const handleReRunAgent = async () => {
    try {
      setIsRunningAgent(true);
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispute_id: disputeId }),
      });
      if (res.ok) fetchDisputeDetails();
    } catch (err) {
      console.error("Failed to trigger agent:", err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas">
        <Header />
        <div className="py-32 text-center text-ink-muted text-caption">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3 text-brand-blue" />
          <span>Loading dispute evidence &amp; draft package…</span>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-surface-canvas">
        <Header />
        <div className="max-w-xl mx-auto py-32 px-6 text-center space-y-5">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-display text-[24px] font-medium text-ink">Dispute Not Found</h2>
          <p className="text-caption text-ink-muted">
            We couldn't locate dispute{" "}
            <code className="font-mono text-brand-blue">{disputeId}</code>.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dispute Desk
          </Link>
        </div>
      </div>
    );
  }

  const formattedAmount = `₹${(dispute.amount / 100).toLocaleString("en-IN")}`;
  const reasonLabel = dispute.reason_code.replace(/_/g, " ").toUpperCase();

  const reasonChip = () => {
    switch (dispute.reason_code) {
      case "fraud": return "border-rose-400 text-rose-700 bg-rose-50";
      case "not_received": return "border-amber-400 text-amber-700 bg-amber-50";
      case "duplicate": return "border-brand-blue text-brand-blue bg-surface-pale-blue";
      default: return "border-rule-hairline text-ink-muted bg-surface-stone";
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-8 space-y-8">

        {/* ── Breadcrumb + action bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rule-hairline">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xs border border-rule-hairline text-ink-muted hover:text-ink hover:border-ink-muted transition-colors"
              title="Back to Disputes Desk"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-[22px] font-medium text-ink tracking-tight">
                  {dispute.payment_id}
                </h1>
                <span className="font-display text-[20px] font-semibold text-brand-blue">
                  {formattedAmount}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${reasonChip()}`}>
                  {reasonLabel}
                </span>
              </div>
              <p className="text-micro text-ink-muted mt-1 flex items-center gap-2">
                <span>Dispute Ref: {dispute.dispute_id}</span>
                {dispute.order_id && (
                  <>
                    <span className="text-rule-hairline">·</span>
                    <span>Order: {dispute.order_id}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: strength + deadline + re-run */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <StrengthIndicator
              score={dispute.strength_score}
              reason={dispute.draft?.strength_reason}
            />
            <DeadlineBadge respondBy={dispute.respond_by} status={dispute.status} />
            <button
              onClick={handleReRunAgent}
              disabled={isRunningAgent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-rule-hairline text-btn text-ink font-medium hover:border-ink-muted transition-colors disabled:opacity-50"
              title="Re-run Razorpay MCP gathering and AI generation"
            >
              {isRunningAgent ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-blue" />
              ) : (
                <Play className="w-3.5 h-3.5 text-brand-blue" />
              )}
              <span>{isRunningAgent ? "Running…" : "Re-run Agent"}</span>
            </button>
          </div>
        </div>

        {/* ── Two-column workbench ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Evidence (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <EvidencePanel evidence={dispute.evidence || []} />
          </div>

          {/* Right: AI Draft (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DraftResponsePanel
              dispute={dispute}
              onRefresh={fetchDisputeDetails}
            />
          </div>
        </div>

        {/* ── Agent audit log ── */}
        <div className="pt-4 border-t border-rule-hairline">
          <AgentLogViewer logs={dispute.logs || []} />
        </div>
      </main>
    </div>
  );
}

