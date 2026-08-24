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
        return <FileCheck className="w-4 h-4 text-brand-blue" />;
      case "fetch_payment_card_details":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "fetch_order":
        return <Package className="w-4 h-4 text-brand-nearblack" />;
      case "fetch_refunds":
        return <RotateCcw className="w-4 h-4 text-brand-coral" />;
      case "fetch_order_payments":
        return <Layers className="w-4 h-4 text-brand-blue" />;
      default:
        return <CreditCard className="w-4 h-4 text-ink-muted" />;
    }
  };

  const renderEvidenceBody = (item: EvidenceItem) => {
    if (!item.available || !item.content) {
      return (
        <div className="text-micro text-rose-700 bg-rose-50 p-3 rounded-sm border border-rose-200">
          Data unavailable from Razorpay MCP gateway or record not present.
        </div>
      );
    }

    const data = item.content as Record<string, any>;

    switch (item.source) {
      case "fetch_payment":
        return (
          <div className="space-y-1.5 text-caption text-ink">
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Amount &amp; Status:</span>
              <span className="font-semibold text-ink">
                ₹{((data.amount || 0) / 100).toLocaleString("en-IN")} · {data.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Method &amp; Bank:</span>
              <span className="font-medium">
                {data.method?.toUpperCase()} {data.bank ? `(${data.bank})` : ""} {data.vpa ? `· ${data.vpa}` : ""}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Customer:</span>
              <span className="text-ink-muted">{data.email || "N/A"} · {data.contact || "N/A"}</span>
            </div>
            {data.notes?.tracking_number && (
              <div className="flex justify-between py-1.5 border-b border-rule-hairline">
                <span className="text-ink-muted">Carrier Tracking:</span>
                <span className="font-mono text-brand-blue">{data.notes.tracking_number}</span>
              </div>
            )}
            {data.notes?.ip_address && (
              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">Device IP:</span>
                <span className="font-mono text-ink-muted">{data.notes.ip_address}</span>
              </div>
            )}
          </div>
        );

      case "fetch_payment_card_details":
        return (
          <div className="space-y-1.5 text-caption text-ink">
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Cardholder &amp; Issuer:</span>
              <span className="font-semibold">{data.name || "CARDHOLDER"} · {data.issuer || "Bank"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Network &amp; Type:</span>
              <span>{data.network} {data.type?.toUpperCase()} ending in •••• {data.last4}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-rule-hairline bg-surface-pale-green px-2 rounded-xs">
              <span className="text-emerald-800 font-medium">3DS Authentication:</span>
              <span className="font-bold text-emerald-800">
                PASSED ({data.authentication_type || "3DS OTP"})
              </span>
            </div>
            {data.auth_code && (
              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">Auth Reference:</span>
                <span className="font-mono text-[11px] text-ink-muted">{data.auth_code}</span>
              </div>
            )}
          </div>
        );

      case "fetch_order":
        return (
          <div className="space-y-1.5 text-caption text-ink">
            <div className="flex justify-between py-1.5 border-b border-rule-hairline">
              <span className="text-ink-muted">Receipt &amp; Status:</span>
              <span className="font-semibold">{data.receipt || data.id} · {data.status?.toUpperCase()}</span>
            </div>
            {data.notes?.fulfillment_partner && (
              <div className="flex justify-between py-1.5 border-b border-rule-hairline">
                <span className="text-ink-muted">Logistics Partner:</span>
                <span>{data.notes.fulfillment_partner}</span>
              </div>
            )}
            {data.notes?.waybill && (
              <div className="flex justify-between py-1.5 border-b border-rule-hairline">
                <span className="text-ink-muted">Waybill / AWB:</span>
                <span className="font-mono text-brand-blue">{data.notes.waybill}</span>
              </div>
            )}
            {data.notes?.item_sku && (
              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">SKU Description:</span>
                <span>{data.notes.item_sku}</span>
              </div>
            )}
          </div>
        );

      case "fetch_refunds":
        const refundsList = Array.isArray(data.items) ? data.items : [];
        return (
          <div className="text-caption text-ink">
            {refundsList.length === 0 ? (
              <div className="p-2.5 bg-surface-pale-green text-emerald-800 rounded-xs text-micro font-medium">
                No prior refunds or settlement charge adjustments. Clean ledger.
              </div>
            ) : (
              <div className="space-y-1">
                {refundsList.map((r: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-rule-hairline">
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
          <div className="text-caption text-ink space-y-1.5">
            <div className="text-ink-muted mb-1 text-micro">
              Order payment attempts ({attempts.length} total):
            </div>
            {attempts.map((att: any, idx: number) => (
              <div
                key={idx}
                className={`flex justify-between py-1.5 px-2.5 rounded-xs text-micro ${
                  att.status === "captured"
                    ? "bg-surface-pale-green text-emerald-800 font-medium"
                    : "bg-surface-stone text-ink-muted"
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
          <pre className="text-[11px] bg-surface-stone p-2.5 rounded-xs overflow-x-auto font-mono text-ink">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-rule-hairline">
        <h3 className="font-display font-medium text-ink text-[16px] flex items-center gap-2">
          <span>Gathered Evidence</span>
        </h3>
        <span className="mono-label text-[11px] px-2.5 py-0.5 rounded-full border border-rule-hairline bg-surface-stone text-ink-muted">
          {evidence.filter((e) => e.available).length} / {evidence.length} sources
        </span>
      </div>

      {evidence.length === 0 ? (
        <div className="p-10 text-center bg-surface-stone/30 border border-dashed border-rule-hairline rounded-sm text-ink-muted text-caption">
          No evidence records available yet. The agent will populate this automatically via Razorpay MCP.
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((item, idx) => {
            const isJsonOpen = expandedJson === (item.source || String(idx));

            return (
              <div
                key={idx}
                className="bg-surface-canvas border border-rule-hairline rounded-sm p-4 hover:border-ink-muted/50 transition-colors"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xs bg-surface-stone border border-rule-hairline">
                      {getSourceIcon(item.source)}
                    </div>
                    <span className="font-medium text-ink text-caption">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {item.available ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-surface-pale-green px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Unavailable
                      </span>
                    )}

                    {item.content && (
                      <button
                        onClick={() =>
                          setExpandedJson(isJsonOpen ? null : (item.source || String(idx)))
                        }
                        className="text-ink-muted hover:text-ink p-1 rounded transition-colors"
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
                  <div className="mt-3 pt-3 border-t border-rule-hairline">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-ink-muted font-mono">
                      <span>mcp://razorpay/{item.source}</span>
                      <span>JSON payload</span>
                    </div>
                    <pre className="p-3 bg-brand-nearblack text-slate-200 text-[11px] font-mono rounded-sm overflow-x-auto max-h-56">
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

