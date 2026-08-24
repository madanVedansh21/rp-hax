-- ChargebackAI: Supabase / PostgreSQL Database Schema

-- 1. Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id TEXT UNIQUE NOT NULL,       -- Razorpay dispute ID (e.g. disp_123)
  payment_id TEXT NOT NULL,              -- Razorpay payment ID (e.g. pay_123)
  order_id TEXT,                         -- Razorpay order ID (e.g. order_123)
  amount INTEGER NOT NULL,               -- in paise (e.g. 850000 = ₹8,500)
  currency TEXT DEFAULT 'INR',
  reason_code TEXT NOT NULL,             -- fraud | not_received | not_as_described | duplicate | subscription_cancelled | general
  respond_by TIMESTAMPTZ NOT NULL,       -- dispute submission deadline
  status TEXT DEFAULT 'pending',         -- pending | in_progress | ready | submitted
  strength_score TEXT,                   -- STRONG | MODERATE | WEAK
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Evidence Items table
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  source TEXT NOT NULL,                  -- e.g. fetch_payment, fetch_order, fetch_card_details, fetch_refunds, ai_generated
  label TEXT NOT NULL,                   -- Human-readable label (e.g. "Payment Record")
  content JSONB NOT NULL,                -- Structured JSON data
  available BOOLEAN DEFAULT TRUE,        -- false if fetch failed or data unavailable
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Agent Execution Logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                  -- AGENT_START, FETCH_PAYMENT, FETCH_ORDER, FETCH_REFUNDS, CLASSIFY, GENERATE, AGENT_COMPLETE, etc.
  status TEXT NOT NULL,                  -- SUCCESS | FAILED | SKIPPED | WARNING
  detail JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Response Drafts table
CREATE TABLE IF NOT EXISTS response_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  summary TEXT,                          -- 200-word bank-facing summary
  merchant_statement TEXT,               -- First-person merchant statement
  evidence_index JSONB DEFAULT '[]'::jsonb, -- Structured array of evidence items with justifications
  missing_evidence TEXT[] DEFAULT '{}',  -- List of missing items that could improve case
  is_edited BOOLEAN DEFAULT FALSE,       -- Flag indicating if merchant modified AI draft
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_dispute_id ON disputes(dispute_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_evidence_dispute_id ON evidence_items(dispute_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_dispute_id ON agent_logs(dispute_id);
CREATE INDEX IF NOT EXISTS idx_drafts_dispute_id ON response_drafts(dispute_id);
