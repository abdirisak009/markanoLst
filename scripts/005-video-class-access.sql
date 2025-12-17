-- Create video_class_access table to store which classes can access which videos
CREATE TABLE IF NOT EXISTS video_class_access (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_id, class_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_class_access_video ON video_class_access(video_id);
CREATE INDEX IF NOT EXISTS idx_video_class_access_class ON video_class_access(class_id);
CREATE INDEX IF NOT EXISTS idx_video_class_access_university ON video_class_access(university_id);
