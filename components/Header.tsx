"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Sparkles,
  Zap,
  RefreshCw,
  PlusCircle,
  Database,
  ArrowRight,
} from "lucide-react";

interface HeaderProps {
  onSeeded?: () => void;
  onSimulateWebhook?: () => void;
}

export function Header({ onSeeded, onSimulateWebhook }: HeaderProps) {
  const [seeding, setSeeding] = useState(false);

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
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-razorpay-700 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                    Chargeback<span className="text-blue-600 dark:text-blue-400">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                    Razorpay MCP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Autonomous Dispute Defense & Revenue Recovery
                </p>
              </div>
            </Link>
          </div>

          {/* Center / Status */}
          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Agent Live & Ready</span>
            </div>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Track 03: AI Revenue Recovery
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              title="Seed 3 test disputes (Fraud, Not Received, Duplicate) with full agent pipeline"
            >
              {seeding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span>{seeding ? "Seeding..." : "Seed 3 Demo Cases"}</span>
            </button>

            {onSimulateWebhook && (
              <button
                onClick={onSimulateWebhook}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all hover:shadow-md hover:shadow-blue-600/40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Webhook</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
