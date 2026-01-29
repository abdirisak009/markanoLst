-- 15-day inactivity warning: record when we send "account will be suspended" WhatsApp.
-- So we don't send the same warning repeatedly; only again if they were active and then inactive 15+ days again.
CREATE TABLE IF NOT EXISTS inactivity_15day_warning_sent (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inactivity_15day_student ON inactivity_15day_warning_sent(student_id);
CREATE INDEX IF NOT EXISTS idx_inactivity_15day_sent_at ON inactivity_15day_warning_sent(sent_at DESC);

COMMENT ON TABLE inactivity_15day_warning_sent IS '15 days no lesson activity: sent WhatsApp warning that account will be suspended';
