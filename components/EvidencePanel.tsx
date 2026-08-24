"use client";

import React, { useState } from "react";
import { EvidenceItem } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
  RotateCcw,
  Layers,
  Code2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export function EvidencePanel({ evidence }: EvidencePanelProps) {
  const [expandedJson, setExpandedJson] = useState<string | null>(null);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "fetch_payment":
        return <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "fetch_payment_card_details":
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "fetch_order":
        return <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "fetch_refunds":
        return <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "fetch_order_payments":
        return <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  const renderEvidenceBody = (item: EvidenceItem) => {
    if (!item.available || !item.content) {
      return (
        <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
          ⚠️ Data unavailable from gateway API or record not present.
        </div>
      );
    }

    const data = item.content as Record<string, any>;

    switch (item.source) {
      case "fetch_payment":
        return (
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Amount & Status:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                ₹{((data.amount || 0) / 100).toLocaleString("en-IN")} • {data.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method & Bank:</span>
              <span className="font-medium">
                {data.method?.toUpperCase()} {data.bank ? `(${data.bank})` : ""} {data.vpa ? `• ${data.vpa}` : ""}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Customer:</span>
              <span>{data.email || "N/A"} • {data.contact || "N/A"}</span>
            </div>
            {data.notes?.tracking_number && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Carrier Tracking:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{data.notes.tracking_number}</span>
              </div>
            )}
            {data.notes?.ip_address && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Device IP:</span>
                <span className="font-mono">{data.notes.ip_address}</span>
              </div>
            )}
          </div>
        );

      case "fetch_payment_card_details":
        return (
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Cardholder & Issuer:</span>
              <span className="font-semibold">{data.name || "CARDHOLDER"} • {data.issuer || "Bank"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Network & Type:</span>
              <span>{data.network} {data.type?.toUpperCase()} ending in •••• {data.last4}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 px-1.5 rounded">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">3DS Authentication:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                ✅ PASSED ({data.authentication_type || "3DS OTP"})
              </span>
            </div>
            {data.auth_code && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Auth Reference:</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{data.auth_code}</span>
              </div>
            )}
          </div>
        );

      case "fetch_order":
        return (
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Receipt & Status:</span>
              <span className="font-semibold">{data.receipt || data.id} • {data.status?.toUpperCase()}</span>
            </div>
            {data.notes?.fulfillment_partner && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Logistics Partner:</span>
                <span>{data.notes.fulfillment_partner}</span>
              </div>
            )}
            {data.notes?.waybill && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Waybill / AWB:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{data.notes.waybill}</span>
              </div>
            )}
            {data.notes?.item_sku && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">SKU Description:</span>
                <span>{data.notes.item_sku}</span>
              </div>
            )}
          </div>
        );

      case "fetch_refunds":
        const refundsList = Array.isArray(data.items) ? data.items : [];
        return (
          <div className="text-xs text-slate-700 dark:text-slate-300">
            {refundsList.length === 0 ? (
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded text-slate-600 dark:text-slate-300">
                ✅ No prior refunds or settlement charge adjustments. Clean ledger.
              </div>
            ) : (
              <div className="space-y-1">
                {refundsList.map((r: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Refund {r.id}:</span>
                    <span>₹{(r.amount / 100).toLocaleString("en-IN")} ({r.status})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "fetch_order_payments":
        const attempts = Array.isArray(data.attempts) ? data.attempts : [];
        return (
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="text-slate-500 mb-1">
              Order payment attempts ({attempts.length} total):
            </div>
            {attempts.map((att: any, idx: number) => (
              <div
                key={idx}
                className={`flex justify-between py-1 px-2 rounded text-[11px] ${
                  att.status === "captured"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400"
                }`}
              >
                <span>{att.id}</span>
                <span className="font-semibold">{att.status?.toUpperCase()} (₹{(att.amount / 100).toLocaleString("en-IN")})</span>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <pre className="text-[11px] bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <span>Gathered Evidence</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {evidence.filter((e) => e.available).length} of {evidence.length} sources
          </span>
        </h3>
      </div>

      {evidence.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
          No evidence records available yet. The agent will populate this automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((item, idx) => {
            const isJsonOpen = expandedJson === (item.source || String(idx));

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getSourceIcon(item.source)}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.available ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Unavailable
                      </span>
                    )}

                    {item.content && (
                      <button
                        onClick={() =>
                          setExpandedJson(isJsonOpen ? null : (item.source || String(idx)))
                        }
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
                        title="View Raw MCP JSON"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                {renderEvidenceBody(item)}

                {/* Raw JSON Accordion */}
                {isJsonOpen && item.content && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-500 font-mono">
                      <span>mcp://razorpay/{item.source}</span>
                      <span>JSON payload</span>
                    </div>
                    <pre className="p-2.5 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-lg overflow-x-auto max-h-48">
                      {JSON.stringify(item.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
