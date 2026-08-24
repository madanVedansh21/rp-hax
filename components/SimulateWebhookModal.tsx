"use client";

import React, { useState } from "react";
import { X, Zap, Send, ShieldAlert, CheckCircle2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Simulate Razorpay Webhook
              </h3>
              <p className="text-[11px] text-slate-500">
                Trigger <code className="text-blue-600 font-mono">payment.dispute.created</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFireWebhook} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="fraud">fraud (Card misuse / 3DS test case)</option>
                <option value="not_received">not_received (Goods not delivered)</option>
                <option value="duplicate">duplicate (Billed multiple times)</option>
                <option value="not_as_described">not_as_described (Item differs)</option>
                <option value="subscription_cancelled">subscription_cancelled (Post-cancellation)</option>
                <option value="general">general (Bank-initiated inquiry)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment ID (Mapped to MCP Fixtures)
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="pay_ABC123"
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Dispute Amount (INR ₹)
              </label>
              <input
                type="number"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder="8500"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFiring}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isFiring ? "Ingesting..." : "Fire Webhook"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
