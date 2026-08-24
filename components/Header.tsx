"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  Database,
  Zap,
  X,
} from "lucide-react";

interface HeaderProps {
  onSeeded?: () => void;
  onSimulateWebhook?: () => void;
}

export function Header({ onSeeded, onSimulateWebhook }: HeaderProps) {
  const [seeding, setSeeding] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/demo/seed", { method: "POST" });
      if (res.ok) {
        if (onSeeded) onSeeded();
        else window.location.reload();
      }
    } catch (err) {
      console.error("Failed to seed demo data:", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col">
      {/* Announcement bar — full-width near-black strip */}
      {announcementVisible && (
        <div className="bg-brand-nearblack text-white text-micro h-9 flex items-center justify-center relative px-10">
          <span className="tracking-wide">
            ChargebackAI is now powered by Razorpay MCP — autonomous evidence gathering in seconds.{" "}
            <a href="#" className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity">
              Learn more
            </a>
          </span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main nav — white canvas, hairline border bottom */}
      <header className="bg-surface-canvas border-b border-rule-hairline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Left zone — Logo + wordmark */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-sm bg-brand-nearblack flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity">
                <ShieldCheck className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-[17px] text-ink tracking-tight">
                  Chargeback<span className="text-brand-blue">AI</span>
                </span>
                <span className="mono-label text-[10px] text-ink-muted hidden sm:inline">
                  by Razorpay
                </span>
              </div>
            </Link>

            {/* Center zone — live status */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-caption text-ink-muted">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Agent live</span>
              </div>
              <span className="w-px h-4 bg-rule-hairline" />
              <span className="text-caption text-ink-muted">Track 03 · AI Revenue Recovery</span>
            </div>

            {/* Right zone — actions */}
            <div className="flex items-center gap-3">
              {/* Secondary action — outline style */}
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-rule-hairline text-btn text-ink font-medium hover:border-ink-muted transition-colors disabled:opacity-50"
                title="Seed 3 test disputes with full agent pipeline"
              >
                {seeding ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-muted" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-ink-muted" />
                )}
                <span>{seeding ? "Seeding…" : "Seed Demo"}</span>
              </button>

              {/* Primary action — near-black pill */}
              {onSimulateWebhook && (
                <button
                  onClick={onSimulateWebhook}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Webhook</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
