-- Add start_date and end_date columns to gold_tracks table
-- Replace estimated_duration with actual start and end dates

-- Add new date columns
ALTER TABLE gold_tracks
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comments
COMMENT ON COLUMN gold_tracks.start_date IS 'Track start date (taarikhda u bilaabanayo)';
COMMENT ON COLUMN gold_tracks.end_date IS 'Track end date (taarikhda uu dhamanayo)';

-- Note: estimated_duration column is kept for backward compatibility but can be removed later if needed
