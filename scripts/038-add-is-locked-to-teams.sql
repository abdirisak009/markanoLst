-- Add is_locked column to teams table
ALTER TABLE live_coding_teams 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Reset all teams to unlocked
UPDATE live_coding_teams SET is_locked = false;

-- Clear old participants so teams can be fresh
-- DELETE FROM live_coding_participants;
-- DELETE FROM live_coding_submissions;
