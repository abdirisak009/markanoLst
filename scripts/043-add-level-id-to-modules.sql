-- Add level_id to modules table
-- This allows modules to belong to levels (Track -> Level -> Module -> Lesson)
-- Hierarchy: Track -> Level -> Module -> Lesson

-- Add level_id column to gold_modules (nullable for backward compatibility)
ALTER TABLE gold_modules
ADD COLUMN IF NOT EXISTS level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gold_modules_level_id ON gold_modules(level_id);

-- Add comment
COMMENT ON COLUMN gold_modules.level_id IS 'Level that this module belongs to (modules can be under levels)';

-- Note: track_id is kept for backward compatibility and for modules directly under tracks
