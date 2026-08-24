"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  ShieldAlert,
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params?.id as string;
  const router = useRouter();

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
    // Poll every 4 seconds if agent is in progress
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
      if (res.ok) {
        fetchDisputeDetails();
      }
    } catch (err) {
      console.error("Failed to trigger agent:", err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="py-24 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          <span>Loading dispute evidence & draft package...</span>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Dispute Not Found</h2>
          <p className="text-xs text-slate-400">
            We couldn't locate dispute <code className="font-mono text-blue-400">{disputeId}</code>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedAmount = `₹${(dispute.amount / 100).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back to Disputes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Dispute: {dispute.payment_id}
                </h1>
                <span className="text-lg font-bold text-blue-400">
                  {formattedAmount}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800 uppercase tracking-wider">
                  {dispute.reason_code.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Dispute Ref: {dispute.dispute_id}</span>
                {dispute.order_id && (
                  <>
                    <span>•</span>
                    <span>Order: {dispute.order_id}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <StrengthIndicator
              score={dispute.strength_score}
              reason={dispute.draft?.strength_reason}
            />

            <DeadlineBadge
              respondBy={dispute.respond_by}
              status={dispute.status}
            />

            <button
              onClick={handleReRunAgent}
              disabled={isRunningAgent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
              title="Re-run Razorpay MCP gathering and Claude AI generation"
            >
              {isRunningAgent ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>{isRunningAgent ? "Agent Running..." : "Re-run Agent"}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Workbench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Gathered Evidence (5 columns on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            <EvidencePanel evidence={dispute.evidence || []} />
          </div>

          {/* Right Column: AI Draft Response Workbench (7 columns on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            <DraftResponsePanel
              dispute={dispute}
              onRefresh={fetchDisputeDetails}
            />
          </div>
        </div>

        {/* Bottom Section: Audit Log */}
        <div className="pt-2">
          <AgentLogViewer logs={dispute.logs || []} />
        </div>
      </main>
    </div>
  );
}
