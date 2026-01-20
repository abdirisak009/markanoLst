-- Add student_id column to temporary_activities table to track which student gave the rating
ALTER TABLE temporary_activities 
ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_temporary_activities_student_id ON temporary_activities(student_id);
