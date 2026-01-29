-- Streak WhatsApp: record when admin sends a streak message to a gold student.
-- Ardayga dashboard-ka wuxuu arki karaa markii loo diray streak WhatsApp.
CREATE TABLE IF NOT EXISTS streak_whatsapp_sent (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by_admin_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_streak_whatsapp_sent_student_id ON streak_whatsapp_sent(student_id);
CREATE INDEX IF NOT EXISTS idx_streak_whatsapp_sent_sent_at ON streak_whatsapp_sent(sent_at DESC);

COMMENT ON TABLE streak_whatsapp_sent IS 'Admin sends streak to student via WhatsApp; student can see last sent date on dashboard';
