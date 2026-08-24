import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Dispute,
  EvidenceItem,
  AgentLog,
  ResponseDraft,
  DisputeWithDetails,
} from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// In-Memory/Local Store Fallback for test mode & zero-config hackathon demo runs
class MockDBStore {
  private disputes: Map<string, Dispute> = new Map();
  private evidence: Map<string, EvidenceItem[]> = new Map(); // dispute_id -> EvidenceItem[]
  private logs: Map<string, AgentLog[]> = new Map(); // dispute_id -> AgentLog[]
  private drafts: Map<string, ResponseDraft> = new Map(); // dispute_id -> ResponseDraft

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Initial placeholder empty state or demo state will be loaded via seeder
  }

  async getAllDisputes(): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getDisputeByDisputeId(disputeId: string): Promise<Dispute | null> {
    for (const d of this.disputes.values()) {
      if (d.dispute_id === disputeId || d.id === disputeId) {
        return d;
      }
    }
    return null;
  }

  async getDisputeWithDetails(
    disputeIdOrId: string
  ): Promise<DisputeWithDetails | null> {
    const dispute = await this.getDisputeByDisputeId(disputeIdOrId);
    if (!dispute) return null;

    const evidence = this.evidence.get(dispute.id) || [];
    const logs = (this.logs.get(dispute.id) || []).sort(
      (a, b) =>
        new Date(a.created_at || "").getTime() -
        new Date(b.created_at || "").getTime()
    );
    const draft = this.drafts.get(dispute.id) || null;

    return {
      ...dispute,
      evidence,
      logs,
      draft,
    };
  }

  async upsertDispute(dispute: Partial<Dispute> & { dispute_id: string }): Promise<Dispute> {
    let existing = await this.getDisputeByDisputeId(dispute.dispute_id);
    const now = new Date().toISOString();

    if (existing) {
      const updated: Dispute = {
        ...existing,
        ...dispute,
        updated_at: now,
      };
      this.disputes.set(updated.id, updated);
      return updated;
    } else {
      const id = dispute.id || `disp_uuid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const created: Dispute = {
        id,
        dispute_id: dispute.dispute_id,
        payment_id: dispute.payment_id || "",
        order_id: dispute.order_id || null,
        amount: dispute.amount || 0,
        currency: dispute.currency || "INR",
        reason_code: dispute.reason_code || "general",
        respond_by: dispute.respond_by || new Date(Date.now() + 7 * 86400000).toISOString(),
        status: dispute.status || "pending",
        strength_score: dispute.strength_score || null,
        created_at: dispute.created_at || now,
        updated_at: now,
      };
      this.disputes.set(id, created);
      return created;
    }
  }

  async insertEvidence(disputeInternalId: string, items: EvidenceItem[]): Promise<void> {
    const current = this.evidence.get(disputeInternalId) || [];
    const stamped = items.map((item) => ({
      ...item,
      id: item.id || `evi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dispute_id: disputeInternalId,
      created_at: item.created_at || new Date().toISOString(),
    }));
    this.evidence.set(disputeInternalId, [...current, ...stamped]);
  }

  async insertLog(disputeInternalId: string, log: AgentLog): Promise<void> {
    const current = this.logs.get(disputeInternalId) || [];
    const stamped: AgentLog = {
      ...log,
      id: log.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dispute_id: disputeInternalId,
      created_at: log.created_at || new Date().toISOString(),
    };
    this.logs.set(disputeInternalId, [...current, stamped]);
  }

  async upsertDraft(disputeInternalId: string, draft: Partial<ResponseDraft>): Promise<ResponseDraft> {
    const existing = this.drafts.get(disputeInternalId);
    const now = new Date().toISOString();
    const result: ResponseDraft = {
      id: existing?.id || `draft_${Date.now()}`,
      dispute_id: disputeInternalId,
      summary: draft.summary ?? existing?.summary ?? "",
      merchant_statement: draft.merchant_statement ?? existing?.merchant_statement ?? "",
      evidence_index: draft.evidence_index ?? existing?.evidence_index ?? [],
      missing_evidence: draft.missing_evidence ?? existing?.missing_evidence ?? [],
      strength_score: draft.strength_score ?? existing?.strength_score,
      strength_reason: draft.strength_reason ?? existing?.strength_reason,
      is_edited: draft.is_edited ?? existing?.is_edited ?? false,
      version: (existing?.version ?? 0) + 1,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.drafts.set(disputeInternalId, result);
    return result;
  }

  async clearAll(): Promise<void> {
    this.disputes.clear();
    this.evidence.clear();
    this.logs.clear();
    this.drafts.clear();
  }
}

// Global in-memory singleton across hot-reloads
const globalForStore = globalThis as unknown as { mockStore: MockDBStore };
export const mockStore = globalForStore.mockStore || new MockDBStore();
if (process.env.NODE_ENV !== "production") globalForStore.mockStore = mockStore;

// Unified database operations wrapper
export const db = {
  async getDisputes(): Promise<Dispute[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Dispute[];
    }
    return mockStore.getAllDisputes();
  },

  async getDisputeByDisputeId(disputeId: string): Promise<Dispute | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .or(`dispute_id.eq.${disputeId},id.eq.${disputeId}`)
        .maybeSingle();
      if (!error && data) return data as Dispute;
    }
    return mockStore.getDisputeByDisputeId(disputeId);
  },

  async getDisputeWithDetails(disputeIdOrId: string): Promise<DisputeWithDetails | null> {
    if (supabase) {
      const dispute = await this.getDisputeByDisputeId(disputeIdOrId);
      if (!dispute) return null;

      const [evidenceRes, logsRes, draftsRes] = await Promise.all([
        supabase.from("evidence_items").select("*").eq("dispute_id", dispute.id),
        supabase
          .from("agent_logs")
          .select("*")
          .eq("dispute_id", dispute.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("response_drafts")
          .select("*")
          .eq("dispute_id", dispute.id)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        ...dispute,
        evidence: (evidenceRes.data || []) as EvidenceItem[],
        logs: (logsRes.data || []) as AgentLog[],
        draft: (draftsRes.data || null) as ResponseDraft | null,
      };
    }
    return mockStore.getDisputeWithDetails(disputeIdOrId);
  },

  async upsertDispute(dispute: Partial<Dispute> & { dispute_id: string }): Promise<Dispute> {
    if (supabase) {
      const existing = await this.getDisputeByDisputeId(dispute.dispute_id);
      if (existing) {
        const { data, error } = await supabase
          .from("disputes")
          .update({
            ...dispute,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (!error && data) return data as Dispute;
      } else {
        const { data, error } = await supabase
          .from("disputes")
          .insert({
            ...dispute,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && data) return data as Dispute;
      }
    }
    return mockStore.upsertDispute(dispute);
  },

  async insertEvidence(disputeInternalId: string, items: EvidenceItem[]): Promise<void> {
    if (supabase) {
      await supabase.from("evidence_items").insert(
        items.map((item) => ({
          dispute_id: disputeInternalId,
          source: item.source,
          label: item.label,
          content: item.content,
          available: item.available,
          created_at: new Date().toISOString(),
        }))
      );
    }
    await mockStore.insertEvidence(disputeInternalId, items);
  },

  async insertLog(disputeInternalId: string, log: AgentLog): Promise<void> {
    if (supabase) {
      await supabase.from("agent_logs").insert({
        dispute_id: disputeInternalId,
        action: log.action,
        status: log.status,
        detail: log.detail || {},
        duration_ms: log.duration_ms || 0,
        created_at: new Date().toISOString(),
      });
    }
    await mockStore.insertLog(disputeInternalId, log);
  },

  async upsertDraft(disputeInternalId: string, draft: Partial<ResponseDraft>): Promise<ResponseDraft> {
    if (supabase) {
      const { data } = await supabase
        .from("response_drafts")
        .insert({
          dispute_id: disputeInternalId,
          summary: draft.summary,
          merchant_statement: draft.merchant_statement,
          evidence_index: draft.evidence_index || [],
          missing_evidence: draft.missing_evidence || [],
          is_edited: draft.is_edited ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (data) return data as ResponseDraft;
    }
    return mockStore.upsertDraft(disputeInternalId, draft);
  },
};
