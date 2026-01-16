-- Add module_id to lessons table
-- This allows lessons to be directly under modules (Track -> Module -> Lessons)
-- Hierarchy: Track -> Module -> Lessons (Level is optional/removed)

-- Add module_id column to gold_lessons (nullable for backward compatibility)
ALTER TABLE gold_lessons
ADD COLUMN IF NOT EXISTS module_id INTEGER REFERENCES gold_modules(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gold_lessons_module_id ON gold_lessons(module_id);

-- Add comment
COMMENT ON COLUMN gold_lessons.module_id IS 'Module that this lesson belongs to (lessons can be directly under modules)';
