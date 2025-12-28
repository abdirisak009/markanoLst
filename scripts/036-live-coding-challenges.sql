-- Live Coding Challenge System Database Schema
-- Creates tables for live coding competitions between teams

-- Main challenges table
CREATE TABLE IF NOT EXISTS live_coding_challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  allowed_languages VARCHAR(50) DEFAULT 'html,css',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
  editing_enabled BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_by INTEGER REFERENCES admin_users(id),
  access_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams for each challenge
CREATE TABLE IF NOT EXISTS live_coding_teams (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES live_coding_challenges(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- 'Team A' or 'Team B'
  color VARCHAR(20) DEFAULT '#3b82f6', -- Team color for UI
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants assigned to teams
CREATE TABLE IF NOT EXISTS live_coding_participants (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES live_coding_challenges(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES live_coding_teams(id) ON DELETE CASCADE,
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(255),
  student_type VARCHAR(50) DEFAULT 'university', -- university, penn, gold
  is_active BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code submissions from participants
CREATE TABLE IF NOT EXISTS live_coding_submissions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES live_coding_challenges(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES live_coding_participants(id) ON DELETE CASCADE,
  html_code TEXT DEFAULT '',
  css_code TEXT DEFAULT '',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_final BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_live_coding_teams_challenge ON live_coding_teams(challenge_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_participants_challenge ON live_coding_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_participants_team ON live_coding_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_participants_student ON live_coding_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_submissions_challenge ON live_coding_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_submissions_participant ON live_coding_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_live_coding_challenges_access_code ON live_coding_challenges(access_code);
