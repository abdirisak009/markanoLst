-- Add end_time column to live_coding_challenges table
ALTER TABLE live_coding_challenges 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;

-- Add focus_violations column to live_coding_participants
ALTER TABLE live_coding_participants 
ADD COLUMN IF NOT EXISTS focus_violations INTEGER DEFAULT 0;

-- Add is_locked column to live_coding_participants for disqualification
ALTER TABLE live_coding_participants 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
