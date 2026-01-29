-- ====================================================
-- Instructor agreement & revenue share
-- ====================================================
-- Add: revenue_share_percent, agreement_accepted_at to instructors.
-- Contract PDF is stored in instructor_documents (document_type = 'agreement').
-- ====================================================

ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS revenue_share_percent NUMERIC(5,2) DEFAULT NULL;

ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS agreement_accepted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN instructors.revenue_share_percent IS 'Instructor share of course revenue (0-100). Set by admin when uploading agreement.';
COMMENT ON COLUMN instructors.agreement_accepted_at IS 'When the instructor accepted the contract; NULL if not yet accepted.';
