-- Create temporary_activities table
CREATE TABLE IF NOT EXISTS temporary_activities (
    id SERIAL PRIMARY KEY,
    activity TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_temporary_activities_created_at ON temporary_activities(created_at DESC);
