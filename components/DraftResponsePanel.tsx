"use client";

import React, { useState, useEffect } from "react";
import { DisputeWithDetails, ResponseDraft } from "@/lib/types";
import { generateDisputePdf } from "@/lib/pdf-generator";
import {
  FileDown,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
  RefreshCw,
} from "lucide-react";

interface DraftResponsePanelProps {
  dispute: DisputeWithDetails;
  onRefresh?: () => void;
}

export function DraftResponsePanel({ dispute, onRefresh }: DraftResponsePanelProps) {
  const draft = dispute.draft;

  const [summary, setSummary] = useState(draft?.summary || "");
  const [statement, setStatement] = useState(draft?.merchant_statement || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(dispute.status === "submitted");

  useEffect(() => {
    if (draft) {
      setSummary(draft.summary || "");
      setStatement(draft.merchant_statement || "");
    }
    setIsSubmitted(dispute.status === "submitted");
  }, [draft, dispute.status]);

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/disputes/${dispute.dispute_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          merchant_statement: statement,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to save draft edits:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitToRazorpay = async () => {
    if (confirm("Are you sure you want to finalize and submit this evidence package to Razorpay?")) {
      try {
        setIsSubmitting(true);
        // 1. Save any pending merchant edits
        await fetch(`/api/disputes/${dispute.dispute_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary,
            merchant_statement: statement,
          }),
        });

        // 2. Directly contest and submit via Razorpay SDK
        const res = await fetch(`/api/disputes/${dispute.dispute_id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit",
            draft: {
              amount: dispute.amount,
              summary,
              merchant_statement: statement,
            },
          }),
        });

        if (res.ok) {
          setIsSubmitted(true);
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error("Failed to submit dispute:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDownloadPdf = () => {
    const updatedDispute: DisputeWithDetails = {
      ...dispute,
      draft: {
        ...(dispute.draft as ResponseDraft),
        summary,
        merchant_statement: statement,
      },
    };
    const pdfDoc = generateDisputePdf(updatedDispute);
    pdfDoc.save(`Dispute_Evidence_${dispute.dispute_id}.pdf`);
  };

  if (!draft) {
    return (
      <div className="bg-surface-stone/30 border border-rule-hairline rounded-sm p-10 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-surface-pale-blue flex items-center justify-center mx-auto text-brand-blue">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <h4 className="font-display font-medium text-ink text-body">
          AI Response Generation in Progress
        </h4>
        <p className="text-caption text-ink-muted max-w-sm mx-auto">
          Synthesizing gathered Razorpay MCP evidence into a bank-ready representation package…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-rule-hairline">
        <h3 className="font-display font-medium text-ink text-[16px] flex items-center gap-2">
          <span>AI Dispute Defense Package</span>
          {draft.is_edited && (
            <span className="mono-label text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              Edited by Merchant
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitted}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill border border-rule-hairline text-caption text-ink font-medium hover:border-ink-muted transition-colors disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Saved</span>
              </>
            ) : isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-muted" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-ink-muted" />
                <span>Save Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Bank Reviewer Summary */}
      <div className="bg-surface-canvas border border-rule-hairline rounded-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-caption font-semibold text-ink flex items-center gap-1.5">
            <span>1. Bank Dispute Reviewer Summary</span>
            <span className="text-micro text-ink-muted font-normal">(Executive Overview)</span>
          </label>
          <span className="mono-label text-[10px] text-ink-muted">Editable</span>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={isSubmitted}
          rows={4}
          className="w-full text-caption text-ink bg-surface-canvas border border-rule-hairline rounded-xs p-3 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition leading-relaxed disabled:opacity-75"
          placeholder="Concise bank-facing summary..."
        />
      </div>

      {/* 2. Merchant Statement */}
      <div className="bg-surface-canvas border border-rule-hairline rounded-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-caption font-semibold text-ink flex items-center gap-1.5">
            <span>2. Official Merchant Statement</span>
            <span className="text-micro text-ink-muted font-normal">(First-person declaration)</span>
          </label>
          <span className="mono-label text-[10px] text-ink-muted">Editable</span>
        </div>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          disabled={isSubmitted}
          rows={4}
          className="w-full text-caption text-ink bg-surface-canvas border border-rule-hairline rounded-xs p-3 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition leading-relaxed disabled:opacity-75"
          placeholder="Merchant official declaration statement..."
        />
      </div>

      {/* 3. Evidence Index Checklist */}
      <div className="bg-surface-canvas border border-rule-hairline rounded-sm p-4 space-y-3">
        <h4 className="text-caption font-semibold text-ink">
          3. Structured Evidence Index
        </h4>
        <div className="space-y-2">
          {draft.evidence_index.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xs bg-surface-stone/40 border border-rule-hairline text-caption space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink text-caption">
                  {item.item_number}. {item.title}
                </span>
                <span className="mono-label text-[10px] px-2 py-0.5 rounded-full bg-surface-pale-green text-emerald-800 border border-emerald-200">
                  {item.source}
                </span>
              </div>
              <p className="text-ink text-micro leading-relaxed">
                {item.summary}
              </p>
              <p className="text-ink-muted text-[11px] italic">
                Relevance: {item.relevance}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Missing Evidence / Recommendations */}
      {draft.missing_evidence && draft.missing_evidence.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-caption font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Missing Evidence to Strengthen Win Rate</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-micro text-amber-900">
            {draft.missing_evidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleDownloadPdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill border border-rule-hairline text-btn font-medium text-ink hover:border-ink-muted transition-colors"
        >
          <FileDown className="w-4 h-4 text-brand-blue" />
          <span>Download Evidence PDF</span>
        </button>

        <button
          onClick={handleSubmitToRazorpay}
          disabled={isSubmitting || isSubmitted}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-pill text-btn font-medium transition-opacity ${
            isSubmitted
              ? "bg-emerald-700 text-white cursor-default"
              : "bg-brand-nearblack text-white hover:opacity-90"
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submitted to Razorpay</span>
            </>
          ) : isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Submitting Package…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Approve &amp; Submit to Razorpay →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

