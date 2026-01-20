-- ====================================================
-- Add Coding Practice Support to Lesson Tasks
-- ====================================================
-- This migration adds fields to support coding practice tasks
-- where students can write, test, and submit code directly in the platform

ALTER TABLE lesson_tasks 
ADD COLUMN IF NOT EXISTS programming_language VARCHAR(50) DEFAULT NULL, -- e.g., 'javascript', 'python', 'java', 'cpp', etc.
ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT NULL, -- Array of test cases: [{"input": "...", "expected_output": "...", "is_hidden": false}]
ADD COLUMN IF NOT EXISTS starter_code TEXT DEFAULT NULL, -- Initial code template for students
ADD COLUMN IF NOT EXISTS solution_code TEXT DEFAULT NULL; -- Reference solution (for admin/auto-grading)

-- Update task_type to include 'coding_practice'
-- Note: We'll handle this in application logic, but document it here
COMMENT ON COLUMN lesson_tasks.programming_language IS 'Programming language for coding practice tasks (javascript, python, java, cpp, etc.)';
COMMENT ON COLUMN lesson_tasks.test_cases IS 'JSON array of test cases for code validation: [{"input": "...", "expected_output": "...", "is_hidden": false}]';
COMMENT ON COLUMN lesson_tasks.starter_code IS 'Initial code template shown to students';
COMMENT ON COLUMN lesson_tasks.solution_code IS 'Reference solution code (for admin review/auto-grading)';

-- Create index for faster queries on coding tasks
CREATE INDEX IF NOT EXISTS idx_lesson_tasks_coding ON lesson_tasks(task_type, programming_language) 
WHERE task_type = 'coding_practice';
