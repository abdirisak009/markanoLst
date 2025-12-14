-- Create table to track video watch bonus marks
CREATE TABLE IF NOT EXISTS video_watch_awards (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  videos_completed INTEGER NOT NULL,
  bonus_marks INTEGER NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES university_students(student_id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_watch_awards_student ON video_watch_awards(student_id);

-- Add comments for documentation
COMMENT ON TABLE video_watch_awards IS 'Tracks bonus marks awarded to students for completing videos (1 mark per 2 videos completed)';
COMMENT ON COLUMN video_watch_awards.videos_completed IS 'Total number of videos completed (completion >= 80%) at the time of award';
COMMENT ON COLUMN video_watch_awards.bonus_marks IS 'Number of bonus marks awarded (videos_completed / 2)';
