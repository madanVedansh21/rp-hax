"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dispute } from "@/lib/types";
import { Header } from "@/components/Header";
import { DisputeCard } from "@/components/DisputeCard";
import { SimulateWebhookModal } from "@/components/SimulateWebhookModal";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Zap,
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
    <div className="min-h-screen bg-surface-canvas text-ink">
      <Header
        onSeeded={fetchDisputes}
        onSimulateWebhook={() => setIsModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Hero section ── white canvas, large display type */}
        <section className="pt-16 pb-12 border-b border-rule-hairline">
          <div className="max-w-3xl">
            {/* Mono label / category chip */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="mono-label text-[11px] text-brand-coral border border-brand-coral px-3 py-1 rounded-full">
                AI Revenue Recovery
              </span>
            </div>

            {/* Display headline — tight, carved */}
            <h1 className="font-display text-[42px] sm:text-[56px] font-medium text-ink leading-[1.05] tracking-[-1px] mb-5">
              Autonomous Chargeback<br />
              Defense &amp; Evidence Builder
            </h1>

            <p className="text-body-lg text-ink-muted leading-relaxed max-w-2xl mb-8">
              When a dispute arrives, ChargebackAI gathers multi-source evidence across
              Razorpay MCP tools, analyzes bank reason codes, and generates bank-ready
              defense packages before deadlines expire.
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
              >
                <Zap className="w-4 h-4" />
                Simulate a Dispute
              </button>
              <button
                onClick={async () => {
                  await fetch("/api/demo/seed", { method: "POST" });
                  fetchDisputes();
                }}
                className="text-btn font-medium text-ink underline underline-offset-4 hover:text-brand-blue transition-colors"
              >
                Load demo cases →
              </button>
            </div>
          </div>
        </section>

        {/* ── Metrics strip ── bordered stone cards, flat, no shadows */}
        <section className="py-10 border-b border-rule-hairline">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-rule-hairline border border-rule-hairline rounded-sm overflow-hidden">

            {/* Card 1: Revenue at Risk */}
            <div className="bg-surface-canvas p-6 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="mono-label text-[11px] text-ink-muted">Revenue at Risk</span>
                <AlertTriangle className="w-4 h-4 text-brand-coral" />
              </div>
              <div className="font-display text-[32px] font-medium text-ink leading-none tracking-tight">
                ₹{(totalAtRiskPaise / 100).toLocaleString("en-IN")}
              </div>
              <p className="text-micro text-ink-muted pt-1">
                Across {activeCount} active disputes
              </p>
            </div>

            {/* Card 2: Active Disputes */}
            <div className="bg-surface-canvas p-6 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="mono-label text-[11px] text-ink-muted">Active Disputes</span>
                <Clock className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="font-display text-[32px] font-medium text-brand-blue leading-none tracking-tight">
                {activeCount}
              </div>
              <p className="text-micro text-ink-muted pt-1">
                Requiring response within 7–14 days
              </p>
            </div>

            {/* Card 3: Strong Evidence Rate */}
            <div className="bg-surface-canvas p-6 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="mono-label text-[11px] text-ink-muted">Strong Evidence Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-display text-[32px] font-medium text-emerald-700 leading-none tracking-tight">
                {disputes.length > 0
                  ? `${Math.round((strongEvidenceCount / disputes.length) * 100)}%`
                  : "—"}
              </div>
              <p className="text-micro text-ink-muted pt-1">
                {strongEvidenceCount} of {disputes.length} cases rated STRONG
              </p>
            </div>

            {/* Card 4: Submitted */}
            <div className="bg-surface-canvas p-6 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="mono-label text-[11px] text-ink-muted">Packages Submitted</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-display text-[32px] font-medium text-ink leading-none tracking-tight">
                {submittedCount}
              </div>
              <p className="text-micro text-ink-muted pt-1">
                Submitted to Razorpay dispute desk
              </p>
            </div>
          </div>
        </section>

        {/* ── Disputes section ── */}
        <section className="py-10 space-y-6">
          {/* Section header + filter pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-[22px] font-medium text-ink tracking-tight">
                Merchant Disputes
              </h2>
              <p className="text-caption text-ink-muted mt-0.5">
                Track incoming webhooks, review gathered evidence, and submit bank-ready packages
              </p>
            </div>

            {/* Filter pill tabs — blog-filter-chip style */}
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: `All (${disputes.length})` },
                { key: "active", label: `Active (${activeCount})` },
                { key: "submitted", label: `Submitted (${submittedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`px-4 py-1.5 rounded-xl text-caption font-medium transition-colors border ${
                    filter === tab.key
                      ? "bg-brand-nearblack text-white border-brand-nearblack"
                      : "bg-surface-canvas text-ink border-rule-hairline hover:border-ink-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dispute list */}
          {loading ? (
            <div className="py-20 text-center text-ink-muted text-caption">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3 text-brand-blue" />
              <span>Loading dispute ledger…</span>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="border border-dashed border-rule-light rounded-md p-16 text-center space-y-5 bg-surface-stone/30">
              <div className="w-12 h-12 rounded-sm bg-surface-stone border border-rule-hairline flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 text-ink-muted" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="font-display text-[18px] font-medium text-ink">No disputes found</h3>
                <p className="text-caption text-ink-muted">
                  Seed sample disputes with realistic Indian merchant data or trigger a mock Razorpay webhook.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={async () => {
                    await fetch("/api/demo/seed", { method: "POST" });
                    fetchDisputes();
                  }}
                  className="px-5 py-2.5 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
                >
                  Seed 3 Demo Disputes
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-btn font-medium text-ink underline underline-offset-4 hover:text-brand-blue transition-colors"
                >
                  Simulate Webhook
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-px border border-rule-hairline rounded-sm overflow-hidden">
              {filteredDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SimulateWebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDisputes}
      />
    </div>
  );
}


