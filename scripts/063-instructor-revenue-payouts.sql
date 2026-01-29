-- ====================================================
-- Instructor revenue & payouts
-- ====================================================
-- instructor_payout_requests: request payout, admin marks paid, instructor confirms receipt.
-- instructors.payment_details: bank/mobile money for where to send.
-- Revenue = completed course_payments for instructor's courses × revenue_share_percent.
-- ====================================================

ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS payment_details TEXT DEFAULT NULL;

COMMENT ON COLUMN instructors.payment_details IS 'Bank account or mobile money details for payouts (instructor editable).';

CREATE TABLE IF NOT EXISTS instructor_payout_requests (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  amount_requested NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ DEFAULT NULL,
  payment_reference VARCHAR(255) DEFAULT NULL,
  confirmed_received_at TIMESTAMPTZ DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_payout_requests_instructor ON instructor_payout_requests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_payout_requests_status ON instructor_payout_requests(status);
COMMENT ON TABLE instructor_payout_requests IS 'Instructor requests payout; admin marks paid; instructor confirms receipt. status: pending | paid';
