-- Add price column to learning_courses table
ALTER TABLE learning_courses 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00;

-- Add index for price filtering
CREATE INDEX IF NOT EXISTS idx_learning_courses_price ON learning_courses(price);

-- Update existing courses to have a default price of 0 if they don't have one
UPDATE learning_courses 
SET price = 0.00 
WHERE price IS NULL;
