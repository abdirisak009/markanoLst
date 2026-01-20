-- Add rating column to temporary_activities table
ALTER TABLE temporary_activities 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_temporary_activities_rating ON temporary_activities(rating);
