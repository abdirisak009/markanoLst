-- ====================================================
-- Update Payment Methods Support
-- ====================================================
-- This migration updates the payment table to support
-- offline, wafi_pay, and mastercard payment methods

-- Update payment_method column to support new methods
ALTER TABLE course_payments 
ALTER COLUMN payment_method TYPE VARCHAR(50);

-- Add comment for payment methods
COMMENT ON COLUMN course_payments.payment_method IS 'Payment method: offline, wafi_pay, mastercard';

-- Update status to include more states if needed
COMMENT ON COLUMN course_payments.status IS 'Payment status: pending, completed, failed, refunded';

-- Create index for faster queries on payment method and status
CREATE INDEX IF NOT EXISTS idx_course_payments_method_status ON course_payments(payment_method, status) 
WHERE status = 'pending';
