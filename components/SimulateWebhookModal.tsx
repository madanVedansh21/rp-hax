"use client";

import React, { useState } from "react";
import { X, Zap, Send, CheckCircle2 } from "lucide-react";

interface SimulateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SimulateWebhookModal({
  isOpen,
  onClose,
  onSuccess,
}: SimulateWebhookModalProps) {
  const [reasonCode, setReasonCode] = useState("fraud");
  const [amountRupees, setAmountRupees] = useState("8500");
  const [paymentId, setPaymentId] = useState("pay_ABC123");
  const [isFiring, setIsFiring] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFireWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiring(true);
    setSuccessMsg(null);

    const generatedDisputeId = `disp_SIM_${Date.now().toString().slice(-6)}`;
    const paise = Math.round(parseFloat(amountRupees || "1000") * 100);

    const webhookPayload = {
      entity: "event",
      account_id: "acc_merchant_demo",
      event: "payment.dispute.created",
      contains: ["dispute"],
      payload: {
        dispute: {
          entity: {
            id: generatedDisputeId,
            payment_id: paymentId || `pay_DEMO_${Date.now().toString().slice(-4)}`,
            amount: paise,
            currency: "INR",
            reason_code: reasonCode,
            status: "open",
            respond_by: Math.floor(Date.now() / 1000) + 86400 * 4,
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    try {
      const res = await fetch("/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_mode_simulation_signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (res.ok) {
        setSuccessMsg(`Webhook fired! Dispute ${generatedDisputeId} created and agent launched.`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to fire webhook:", err);
    } finally {
      setIsFiring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-nearblack/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-canvas border border-rule-hairline rounded-md max-w-md w-full p-8 shadow-xl space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-rule-hairline">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-1 text-brand-coral">
              <Zap className="w-3.5 h-3.5" />
              <span className="mono-label text-[10px]">Test Simulation</span>
            </div>
            <h3 className="font-display text-[20px] font-medium text-ink tracking-tight">
              Simulate Razorpay Webhook
            </h3>
            <p className="text-micro text-ink-muted mt-0.5">
              Trigger event <code className="font-mono text-brand-blue">payment.dispute.created</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-xs transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <p className="text-caption font-medium text-emerald-800">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFireWebhook} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-micro font-semibold text-ink">
                Dispute Reason Code
              </label>
              <select
                value={reasonCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setReasonCode(code);
                  if (code === "fraud") setPaymentId("pay_ABC123");
                  else if (code === "not_received") setPaymentId("pay_DEF456");
                  else if (code === "duplicate") setPaymentId("pay_GHI789");
                }}
                className="w-full text-caption bg-surface-canvas border border-rule-hairline rounded-xs p-2.5 text-ink focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none"
              >
                <option value="fraud">fraud (Card misuse / 3DS test case)</option>
                <option value="not_received">not_received (Goods not delivered)</option>
                <option value="duplicate">duplicate (Billed multiple times)</option>
                <option value="not_as_described">not_as_described (Item differs)</option>
                <option value="subscription_cancelled">subscription_cancelled (Post-cancellation)</option>
                <option value="general">general (Bank-initiated inquiry)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-micro font-semibold text-ink">
                Payment ID (Mapped to MCP Fixtures)
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="pay_ABC123"
                className="w-full text-caption font-mono bg-surface-canvas border border-rule-hairline rounded-xs p-2.5 text-ink focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-micro font-semibold text-ink">
                Dispute Amount (INR ₹)
              </label>
              <input
                type="number"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder="8500"
                className="w-full text-caption bg-surface-canvas border border-rule-hairline rounded-xs p-2.5 text-ink focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-rule-hairline">
              <button
                type="button"
                onClick={onClose}
                className="text-btn font-medium text-ink-muted hover:text-ink px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFiring}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill bg-brand-nearblack text-white text-btn font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isFiring ? "Ingesting…" : "Fire Webhook"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



