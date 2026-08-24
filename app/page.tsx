"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dispute } from "@/lib/types";
import { Header } from "@/components/Header";
import { DisputeCard } from "@/components/DisputeCard";
import { SimulateWebhookModal } from "@/components/SimulateWebhookModal";
import {
  ShieldAlert,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "submitted">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDisputes = useCallback(async () => {
    try {
      const res = await fetch("/api/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
    // Auto refresh every 5 seconds to catch live agent updates
    const interval = setInterval(fetchDisputes, 5000);
    return () => clearInterval(interval);
  }, [fetchDisputes]);

  const totalAtRiskPaise = disputes
    .filter((d) => d.status !== "submitted")
    .reduce((acc, d) => acc + d.amount, 0);

  const activeCount = disputes.filter(
    (d) => d.status === "pending" || d.status === "in_progress" || d.status === "ready"
  ).length;

  const submittedCount = disputes.filter((d) => d.status === "submitted").length;
  const strongEvidenceCount = disputes.filter((d) => d.strength_score === "STRONG").length;

  const filteredDisputes = disputes.filter((d) => {
    if (filter === "active") return d.status !== "submitted";
    if (filter === "submitted") return d.status === "submitted";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        onSeeded={fetchDisputes}
        onSimulateWebhook={() => setIsModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner / Value Proposition */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/50 p-6 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Razorpay AI Revenue Recovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Autonomous Chargeback Defense & Evidence Builder
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              When a dispute arrives, ChargebackAI gathers multi-source evidence across Razorpay MCP tools, analyzes bank reason codes, and generates bank-ready defense packages before deadlines expire.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue at Risk */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Revenue at Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              ₹{(totalAtRiskPaise / 100).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400">
              Across {activeCount} active merchant disputes
            </p>
          </div>

          {/* Card 2: Active Disputes */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Disputes</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-400 tracking-tight">
              {activeCount}
            </div>
            <p className="text-[11px] text-slate-400">
              Requiring response within 7-14 days
            </p>
          </div>

          {/* Card 3: Strong Evidence Rate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Strong Evidence Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {disputes.length > 0
                ? `${Math.round((strongEvidenceCount / disputes.length) * 100)}%`
                : "100%"}
            </div>
            <p className="text-[11px] text-slate-400">
              {strongEvidenceCount} of {disputes.length} cases rated STRONG
            </p>
          </div>

          {/* Card 4: Submitted / Protected */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Packages Submitted</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {submittedCount}
            </div>
            <p className="text-[11px] text-slate-400">
              Submitted to Razorpay dispute desk
            </p>
          </div>
        </div>

        {/* Disputes Section Header & Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Merchant Disputes</h2>
              <p className="text-xs text-slate-400">
                Track incoming webhooks, review gathered evidence, and submit bank-ready packages
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({disputes.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === "active"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter("submitted")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === "submitted"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Submitted ({submittedCount})
              </button>
            </div>
          </div>

          {/* Dispute Cards List */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <span>Loading merchant dispute ledger...</span>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center mx-auto text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-bold text-white text-base">No disputes found</h3>
                <p className="text-xs text-slate-400">
                  Seed sample disputes with realistic Indian merchant data or trigger a mock Razorpay webhook.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={async () => {
                    await fetch("/api/demo/seed", { method: "POST" });
                    fetchDisputes();
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
                >
                  Seed 3 Demo Disputes
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Simulate Webhook
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SimulateWebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDisputes}
      />
    </div>
  );
}
