-- Add product_link column to ecommerce_wizard_submissions table
ALTER TABLE ecommerce_wizard_submissions 
ADD COLUMN IF NOT EXISTS product_link TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ecommerce_wizard_submissions' 
AND column_name = 'product_link';
