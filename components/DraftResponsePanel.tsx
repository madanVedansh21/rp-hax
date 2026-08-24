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
  Edit3,
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
        const res = await fetch(`/api/disputes/${dispute.dispute_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "submitted",
            summary,
            merchant_statement: statement,
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
    // Merge latest edited state for PDF
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
          AI Response Generation in Progress
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The AI dispute specialist is synthesizing gathered Razorpay MCP evidence into a bank-ready representation package...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>AI Dispute Defense Package</span>
          {draft.is_edited && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
              Edited by Merchant
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitted}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
              </>
            ) : isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Bank Reviewer Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>1. Bank Dispute Reviewer Summary</span>
            <span className="text-[10px] text-slate-400 font-normal">(Executive Overview)</span>
          </label>
          <span className="text-[10px] text-slate-400">Editable</span>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={isSubmitted}
          rows={4}
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition leading-relaxed disabled:opacity-75"
          placeholder="Concise bank-facing summary..."
        />
      </div>

      {/* 2. Merchant Statement */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>2. Official Merchant Statement</span>
            <span className="text-[10px] text-slate-400 font-normal">(First-person declaration)</span>
          </label>
          <span className="text-[10px] text-slate-400">Editable</span>
        </div>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          disabled={isSubmitted}
          rows={4}
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition leading-relaxed disabled:opacity-75"
          placeholder="Merchant official declaration statement..."
        />
      </div>

      {/* 3. Evidence Index Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
          3. Structured Evidence Index
        </h4>
        <div className="space-y-2">
          {draft.evidence_index.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.item_number}. {item.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono">
                  {item.source}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {item.summary}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] italic">
                Relevance: {item.relevance}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Missing Evidence / Recommendations */}
      {draft.missing_evidence && draft.missing_evidence.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Missing Evidence to Strengthen Win Rate</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-xs text-amber-900 dark:text-amber-200">
            {draft.missing_evidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleDownloadPdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
        >
          <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Download Evidence PDF</span>
        </button>

        <button
          onClick={handleSubmitToRazorpay}
          disabled={isSubmitting || isSubmitted}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-all ${
            isSubmitted
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
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
              <span>Submitting Package...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Approve & Submit to Razorpay →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
