-- ====================================================
-- Payout request: payment method and details
-- ====================================================
-- Instructor chooses: PayPal, Cards, EVC Plus, Bank Transfer.
-- Method-specific details stored (e.g. EVC number, PayPal email, bank account).
-- ====================================================

ALTER TABLE instructor_payout_requests
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL;

ALTER TABLE instructor_payout_requests
  ADD COLUMN IF NOT EXISTS payment_method_details TEXT DEFAULT NULL;

COMMENT ON COLUMN instructor_payout_requests.payment_method IS 'How instructor wants to receive: paypal, cards, evc_plus, bank_transfer';
COMMENT ON COLUMN instructor_payout_requests.payment_method_details IS 'JSON or text: e.g. evc_phone, paypal_email, bank name/account';
