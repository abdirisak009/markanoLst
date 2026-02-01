-- ====================================================
-- Instructor: minimum payout amount per request
-- ====================================================
-- Admin sets per instructor. When requesting payout, instructor
-- cannot request an amount less than this (if set).
-- ====================================================

ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS minimum_payout_amount NUMERIC(10,2) DEFAULT NULL;

COMMENT ON COLUMN instructors.minimum_payout_amount IS 'Minimum amount this instructor can request per payout (e.g. 50.00). NULL = no minimum. Set by admin per instructor.';
