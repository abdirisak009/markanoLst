-- Add whatsapp_number column to gold_students table
-- Migration script to add WhatsApp number field for Markano Gold students

-- Add whatsapp_number column if it doesn't exist
ALTER TABLE gold_students 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);

-- Add comment to the column
COMMENT ON COLUMN gold_students.whatsapp_number IS 'WhatsApp phone number for student contact';

-- Optional: Create index for faster lookups if needed
-- CREATE INDEX IF NOT EXISTS idx_gold_students_whatsapp ON gold_students(whatsapp_number);
