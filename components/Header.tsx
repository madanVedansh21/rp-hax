"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  Database,
  Zap,
  X,
  Github,
  ArrowRight,
} from "lucide-react";

interface HeaderProps {
  onSeeded?: () => void;
  onSimulateWebhook?: () => void;
  showNavLinks?: boolean;
}

export function Header({ onSeeded, onSimulateWebhook, showNavLinks = true }: HeaderProps) {
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
            Razorpay AI Buildathon — <strong>Track 03: AI Revenue Recovery</strong>. Autonomous chargeback defense in milliseconds.{" "}
            <Link href="/dashboard" className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity ml-1 font-medium">
              Open Workbench →
            </Link>
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
      <header className="bg-surface-canvas/95 backdrop-blur border-b border-rule-hairline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">

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
                  for Razorpay
                </span>
              </div>
            </Link>

            {/* Center zone — Nav links */}
            {showNavLinks && (
              <nav className="hidden md:flex items-center gap-8 text-caption text-ink font-medium">
                <Link href="/" className="hover:text-brand-blue transition-colors">
                  Overview
                </Link>
                <Link href="/#problem-statement" className="hover:text-brand-blue transition-colors">
                  Problem Statement
                </Link>
                <Link href="/#architecture" className="hover:text-brand-blue transition-colors">
                  MCP Architecture
                </Link>
                <Link href="/dashboard" className="hover:text-brand-blue transition-colors flex items-center gap-1.5">
                  <span>Disputes Desk</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </Link>
              </nav>
            )}

            {/* Right zone — actions */}
            <div className="flex items-center gap-3">
              {/* GitHub Link */}
              <a
                href="https://github.com/madanVedansh21/rp-hax"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill border border-rule-hairline text-caption text-ink font-medium hover:border-ink-muted transition-colors"
                title="View GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>

              {onSeeded && (
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-rule-hairline text-btn text-ink font-medium hover:border-ink-muted transition-colors disabled:opacity-50"
                  title="Seed 3 test disputes"
                >
                  {seeding ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-muted" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-ink-muted" />
                  )}
                  <span>{seeding ? "Seeding…" : "Seed Demo"}</span>
                </button>
              )}

              {/* Primary action — near-black pill */}
              {onSimulateWebhook ? (
                <button
                  onClick={onSimulateWebhook}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Webhook</span>
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Launch Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

