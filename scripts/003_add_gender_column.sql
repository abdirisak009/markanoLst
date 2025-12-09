-- Add gender column to university_students table
-- This script adds the gender field to store student gender information (Male/Female)

ALTER TABLE university_students ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Optional: Update existing students with a default value if needed
-- UPDATE university_students SET gender = 'Male' WHERE gender IS NULL;
