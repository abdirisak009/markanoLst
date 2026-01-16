-- Add Modules to Markano Gold
-- Migration script to add modules between tracks and levels
-- Hierarchy: Track -> Module -> Level -> Lessons

-- 1. Create gold_modules table
CREATE TABLE IF NOT EXISTS gold_modules (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES gold_tracks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add module_id column to gold_levels (nullable for backward compatibility)
ALTER TABLE gold_levels
ADD COLUMN IF NOT EXISTS module_id INTEGER REFERENCES gold_modules(id) ON DELETE CASCADE;

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gold_modules_track_id ON gold_modules(track_id);
CREATE INDEX IF NOT EXISTS idx_gold_modules_order ON gold_modules(track_id, order_index);
CREATE INDEX IF NOT EXISTS idx_gold_levels_module_id ON gold_levels(module_id);

-- 4. Add comments
COMMENT ON TABLE gold_modules IS 'Modules within tracks - intermediate level between tracks and levels';
COMMENT ON COLUMN gold_levels.module_id IS 'Module that this level belongs to (replaces direct track_id reference)';
