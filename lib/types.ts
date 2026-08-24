export type DisputeReasonCode =
  | "fraud"
  | "not_received"
  | "not_as_described"
  | "duplicate"
  | "subscription_cancelled"
  | "general"
  | string;

export type DisputeStatus = "pending" | "in_progress" | "ready" | "submitted";

export type StrengthScore = "STRONG" | "MODERATE" | "WEAK";

export interface Dispute {
  id: string;
  dispute_id: string;
  payment_id: string;
  order_id?: string | null;
  amount: number; // in paise
  currency: string;
  reason_code: DisputeReasonCode;
  respond_by: string; // ISO 8601 string
  status: DisputeStatus;
  strength_score?: StrengthScore | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  id?: string;
  dispute_id?: string;
  source: string; // e.g. 'fetch_payment', 'fetch_order', 'fetch_card_details', 'fetch_refunds'
  label: string;
  content: Record<string, unknown> | null;
  available: boolean;
  created_at?: string;
}

export interface AgentLog {
  id?: string;
  dispute_id?: string;
  action: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "WARNING";
  detail?: Record<string, unknown>;
  duration_ms?: number;
  created_at?: string;
}

export interface EvidenceIndexItem {
  item_number: number;
  source: string;
  title: string;
  summary: string;
  relevance: string;
  available: boolean;
}

export interface ResponseDraft {
  id?: string;
  dispute_id?: string;
  summary: string;
  merchant_statement: string;
  evidence_index: EvidenceIndexItem[];
  missing_evidence: string[];
  strength_score?: StrengthScore;
  strength_reason?: string;
  is_edited: boolean;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export interface DisputeWithDetails extends Dispute {
  evidence: EvidenceItem[];
  logs: AgentLog[];
  draft?: ResponseDraft | null;
}

export interface EvidenceStrategy {
  reason_code: DisputeReasonCode;
  claim_summary: string;
  required_evidence_sources: string[];
  key_arguments: string[];
  recommended_merchant_points: string[];
}

export interface RazorpayWebhookDisputeEntity {
  id: string;
  payment_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  reason_code: string;
  status: string;
  respond_by: number; // unix timestamp
  created_at: number;
}

export interface RazorpayDisputeWebhookEvent {
  entity: string;
  account_id: string;
  event: "payment.dispute.created" | "payment.dispute.won" | "payment.dispute.lost" | string;
  contains: string[];
  payload: {
    dispute: {
      entity: RazorpayWebhookDisputeEntity;
    };
  };
  created_at: number;
}
