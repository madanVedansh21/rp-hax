"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SimulateWebhookModal } from "@/components/SimulateWebhookModal";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Github,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  FileCheck,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("Defend against fraud chargeback for payment pay_ABC123 (₹8,500)");
  const [isSimulating, setIsSimulating] = useState(false);

  const handlePromptGo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    try {
      await fetch("/api/demo/seed", { method: "POST" });
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink flex flex-col selection:bg-brand-blue selection:text-white">
      <Header
        showNavLinks={true}
        onSimulateWebhook={() => setIsModalOpen(true)}
      />

      <main className="flex-1">
        {/* ── 1. Hero Section ── */}
        <section className="pt-16 sm:pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            {/* Hackathon track chip */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="mono-label text-[11px] text-brand-coral border border-brand-coral/60 bg-brand-coral/5 px-3.5 py-1 rounded-full">
                Razorpay AI Buildathon · Track 03: AI Revenue Recovery
              </span>
            </div>

            {/* Monumental display headline */}
            <h1 className="font-display text-[44px] sm:text-[68px] lg:text-[76px] font-medium text-ink leading-[1.02] tracking-[-1.5px] mb-6">
              Autonomous Chargeback Defense for Razorpay Merchants.
            </h1>

            <p className="text-body-lg text-ink-muted leading-relaxed max-w-3xl mb-8">
              The moment a chargeback webhook arrives, ChargebackAI autonomously gathers
              multi-source evidence across Razorpay MCP tools, analyzes bank reason codes,
              and synthesizes bank-ready representation packages before the 7–14 day deadline expires.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-all shadow-sm"
              >
                <span>Launch Dispute Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-pill border border-rule-hairline bg-surface-canvas text-ink text-btn font-medium hover:border-ink transition-colors"
              >
                <Zap className="w-4 h-4 text-brand-coral" />
                <span>Simulate Webhook</span>
              </button>

              <a
                href="https://github.com/madanVedansh21/rp-hax"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-btn font-medium text-ink underline underline-offset-4 hover:text-brand-blue transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* ── 2. Signature Two-Card Media Composition (Cohere Hero Spec) ── */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Card: Atmospheric Gradient + Interactive Agent Console (~65% width) */}
            <div
              className="lg:col-span-8 rounded-[22px] p-6 sm:p-9 relative overflow-hidden border border-rule-hairline/60 flex items-center justify-center min-h-[400px]"
              style={{
                background:
                  "radial-gradient(circle at 15% 20%, rgba(255, 119, 89, 0.24), transparent 45%), radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.35), transparent 50%), radial-gradient(circle at 50% 85%, rgba(15, 23, 42, 0.98), #090d16)",
              }}
            >
              {/* Floating Dark Agent Console Mockup */}
              <div className="w-full max-w-xl bg-[#111216]/95 border border-white/10 rounded-xl p-6 sm:p-7 shadow-2xl backdrop-blur space-y-5">
                {/* Agent Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-sm bg-white text-ink flex items-center justify-center font-display font-bold text-base shadow-sm">
                      A
                    </div>
                    <div>
                      <h3 className="font-display font-medium text-white text-[17px] tracking-tight">
                        Autonomous Chargeback Defense Agent
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Powered by Razorpay MCP &amp; Claude 3.5 Sonnet
                      </p>
                    </div>
                  </div>

                  <span className="mono-label text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                </div>

                {/* Scenario Quick Selector Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-mono">Select test case:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: "💳 Fraud (3DS Passed)", id: "pay_ABC123", text: "Defend against fraud chargeback for payment pay_ABC123 (₹8,500)" },
                      { label: "📦 Goods Not Received", id: "pay_DEF456", text: "Compile courier tracking & AWB proof for payment pay_DEF456 (₹12,400)" },
                      { label: "🔄 Duplicate Charge", id: "pay_GHI789", text: "Reconcile duplicate settlement & refund records for payment pay_GHI789 (₹4,200)" },
                    ].map((scenario, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptInput(scenario.text)}
                        className={`mono-label text-[10px] px-2.5 py-1 rounded-full transition-colors border ${
                          promptInput === scenario.text
                            ? "bg-brand-coral text-white border-brand-coral font-semibold"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {scenario.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Prompt Field */}
                <form
                  onSubmit={handlePromptGo}
                  className="flex items-center justify-between gap-3 bg-[#191a21] border border-white/10 rounded-lg p-2 sm:p-2.5 focus-within:border-brand-blue/60 transition-colors"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-transparent text-caption text-slate-100 placeholder-slate-500 focus:outline-none px-2"
                    placeholder="Enter dispute prompt or payment reference..."
                  />
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="px-4 py-2 rounded-pill bg-white text-ink text-btn font-semibold hover:bg-slate-200 transition-colors shrink-0 flex items-center gap-1.5 shadow"
                  >
                    <span>{isSimulating ? "Launching…" : "Investigate"}</span>
                    {!isSimulating && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>

                {/* Status Chips Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span>MCP Tools: <strong className="text-slate-200">5 active</strong></span>
                    <span>·</span>
                    <span>Reason Engine: <strong className="text-slate-200">Razorpay SDK</strong></span>
                  </div>
                  <span className="text-emerald-400 hidden sm:inline-block">● Bank Admissible Format</span>
                </div>
              </div>
            </div>

            {/* Right Card: Companion Sage/Teal Gradient with Glowing Coral Light Orb (~35% width) */}
            <div
              className="lg:col-span-4 rounded-[22px] p-8 border border-rule-hairline/60 relative overflow-hidden flex flex-col justify-between min-h-[400px]"
              style={{
                background:
                  "radial-gradient(circle at 75% 25%, rgba(255, 140, 110, 0.75), rgba(255, 119, 89, 0.25) 30%, transparent 65%), radial-gradient(circle at 20% 80%, rgba(0, 60, 51, 0.95), #021a16)",
              }}
            >
              <div className="space-y-3">
                <span className="mono-label text-[10px] text-white/90 border border-white/25 bg-white/10 px-3 py-1 rounded-full">
                  Razorpay AI Buildathon
                </span>
                <h4 className="font-display font-medium text-white text-[24px] sm:text-[26px] leading-tight pt-1">
                  Zero Human Delay in Evidence Gathering.
                </h4>
                <p className="text-micro text-slate-300 leading-relaxed">
                  Autonomously contests disputes within milliseconds of receiving webhooks, preventing 60–70% of winnable revenue loss.
                </p>
              </div>

              <div className="space-y-4 pt-6">
                <div className="p-4 rounded-sm bg-black/40 border border-white/10 backdrop-blur text-white text-caption space-y-2">
                  <div className="flex justify-between text-micro text-slate-300 font-mono">
                    <span>Evidence Strength Admissibility</span>
                    <span className="text-emerald-300 font-bold">STRONG (100%)</span>
                  </div>
                  <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-full rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-micro text-slate-200 font-mono">
                  <span>Track 03: Revenue Recovery</span>
                  <Link
                    href="/dashboard"
                    className="underline underline-offset-4 font-semibold hover:text-white transition-colors"
                  >
                    Open Desk →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 3. The Hackathon Problem Statement ── */}
        <section id="problem-statement" className="py-20 border-t border-rule-hairline bg-surface-stone/30 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl space-y-4">
              <span className="mono-label text-[11px] text-brand-coral border border-brand-coral px-3 py-0.5 rounded-full">
                The Problem Statement
              </span>
              <h2 className="font-display text-[32px] sm:text-[44px] font-medium text-ink leading-tight tracking-tight">
                Indian merchants lose 60–70% of winnable chargebacks purely due to poor response quality and missed deadlines.
              </h2>
              <p className="text-body text-ink-muted leading-relaxed">
                When an issuing bank flags a dispute, the merchant receives 7–14 days to respond. Non-technical merchants panic, scramble across disjointed dashboards, write weak unstructured emails, and end up forfeiting their legitimate revenue.
              </p>
            </div>

            {/* 3-Column Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-canvas p-7 border border-rule-hairline rounded-sm space-y-3">
                <div className="w-9 h-9 rounded-xs bg-surface-stone border border-rule-hairline flex items-center justify-center text-brand-coral font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="font-display font-medium text-ink text-[18px]">
                  Buried Alerts &amp; Panic
                </h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Chargeback emails get lost in merchant inboxes. By the time they notice, only 24–48 hours remain to respond before auto-forfeiture.
                </p>
              </div>

              <div className="bg-surface-canvas p-7 border border-rule-hairline rounded-sm space-y-3">
                <div className="w-9 h-9 rounded-xs bg-surface-stone border border-rule-hairline flex items-center justify-center text-brand-blue font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="font-display font-medium text-ink text-[18px]">
                  Fragmented Evidence
                </h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Crucial 3DS OTP logs, logistics waybill numbers, and payment authorization timestamps are scattered across separate systems.
                </p>
              </div>

              <div className="bg-surface-canvas p-7 border border-rule-hairline rounded-sm space-y-3">
                <div className="w-9 h-9 rounded-xs bg-surface-stone border border-rule-hairline flex items-center justify-center text-emerald-700 font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="font-display font-medium text-ink text-[18px]">
                  Bank Format Rejections
                </h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Bank review officers reject unstructured emotional emails. They demand structured executive summaries and formal evidence indices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. The Architecture & Solution ── */}
        <section id="architecture" className="py-20 border-t border-rule-hairline px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="space-y-12">
            <div className="max-w-3xl space-y-4">
              <span className="mono-label text-[11px] text-brand-blue border border-brand-blue px-3 py-0.5 rounded-full">
                Autonomous Architecture
              </span>
              <h2 className="font-display text-[32px] sm:text-[44px] font-medium text-ink leading-tight tracking-tight">
                How ChargebackAI Solves It with Razorpay MCP
              </h2>
              <p className="text-body text-ink-muted leading-relaxed">
                An end-to-end pipeline combining Model Context Protocol tools, Anthropic Claude, and the Razorpay SDK to eliminate human delay.
              </p>
            </div>

            {/* 4-Step Pipeline Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule-hairline border border-rule-hairline rounded-sm overflow-hidden">
              <div className="bg-surface-canvas p-6 space-y-2">
                <div className="mono-label text-[11px] text-brand-blue">Step 1</div>
                <h4 className="font-display font-medium text-ink text-[16px]">Webhook Ingestion</h4>
                <p className="text-micro text-ink-muted leading-relaxed">
                  HMAC verification on <code className="font-mono text-[11px]">payment.dispute.created</code> triggers background worker.
                </p>
              </div>

              <div className="bg-surface-canvas p-6 space-y-2">
                <div className="mono-label text-[11px] text-brand-blue">Step 2</div>
                <h4 className="font-display font-medium text-ink text-[16px]">MCP Evidence Pull</h4>
                <p className="text-micro text-ink-muted leading-relaxed">
                  Queries 5 Razorpay tools for card 3DS proof, order AWB tracking, and prior refund records.
                </p>
              </div>

              <div className="bg-surface-canvas p-6 space-y-2">
                <div className="mono-label text-[11px] text-brand-blue">Step 3</div>
                <h4 className="font-display font-medium text-ink text-[16px]">Claude AI Synthesis</h4>
                <p className="text-micro text-ink-muted leading-relaxed">
                  Generates bank executive summary, formal first-person merchant declaration, and itemized index.
                </p>
              </div>

              <div className="bg-surface-canvas p-6 space-y-2">
                <div className="mono-label text-[11px] text-brand-blue">Step 4</div>
                <h4 className="font-display font-medium text-ink text-[16px]">1-Click Contest</h4>
                <p className="text-micro text-ink-muted leading-relaxed">
                  Auto-registers draft to freeze clock, then submits directly to Razorpay dispute desk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Full-Width Deep Enterprise Green CTA Band ── */}
        <section className="bg-brand-green text-white py-20 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="mono-label text-[11px] text-brand-coral border border-brand-coral/60 bg-brand-coral/10 px-3 py-0.5 rounded-full">
                Ready for Evaluation
              </span>
              <h3 className="font-display text-[32px] sm:text-[40px] font-medium leading-tight tracking-tight text-white">
                Defend against lost chargebacks in milliseconds.
              </h3>
              <p className="text-caption text-slate-300 leading-relaxed">
                Test the live merchant dispute ledger with realistic Indian transaction fixtures or simulate a webhook.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-pill bg-white text-ink text-btn font-semibold hover:bg-slate-100 transition-colors shadow-lg"
              >
                <span>Open Dispute Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/madanVedansh21/rp-hax"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-pill border border-white/30 text-white text-btn font-medium hover:border-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── 6. Minimal Clean Footer ── */}
      <footer className="border-t border-rule-hairline py-8 px-6 lg:px-8 bg-surface-canvas text-ink-muted text-caption">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-medium text-ink">ChargebackAI</span>
            <span>·</span>
            <span>Razorpay AI Buildathon 2026 (Track 03)</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-ink hover:text-brand-blue transition-colors">
              Dispute Desk
            </Link>
            <a
              href="https://github.com/madanVedansh21/rp-hax"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-ink hover:text-brand-blue transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </footer>

      <SimulateWebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}





