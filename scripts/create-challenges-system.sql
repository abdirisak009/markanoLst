-- Create Challenges System Tables

-- Main challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'coding', 'quiz', 'assignment', 'project', etc.
  scope VARCHAR(20) NOT NULL, -- 'class' or 'group'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  max_score INTEGER DEFAULT 100,
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 1,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge participants (classes or groups)
CREATE TABLE IF NOT EXISTS challenge_participants (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  participant_type VARCHAR(20) NOT NULL, -- 'class' or 'group'
  participant_id INTEGER NOT NULL, -- class_id or group_id
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(challenge_id, participant_type, participant_id)
);

-- Student submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  student_id VARCHAR(50) NOT NULL,
  round_number INTEGER DEFAULT 1,
  submission_content TEXT,
  submission_url TEXT,
  score INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP,
  graded_by VARCHAR(255),
  feedback TEXT
);

-- Leaderboard/Rankings
CREATE TABLE IF NOT EXISTS challenge_rankings (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  student_id VARCHAR(50) NOT NULL,
  total_score INTEGER DEFAULT 0,
  rank INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(challenge_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON challenge_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_rankings_challenge ON challenge_rankings(challenge_id);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON challenge_rankings(challenge_id, rank);
