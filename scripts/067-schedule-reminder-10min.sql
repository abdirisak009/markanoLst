-- Support two reminder windows: 1 saac kahor iyo 10 daqiiqo kahor.
-- Add reminder_minutes_before (60 or 10) so we can send both without duplicate key.

ALTER TABLE schedule_reminder_sent
  ADD COLUMN IF NOT EXISTS reminder_minutes_before INTEGER NOT NULL DEFAULT 60;

-- Drop old unique constraint (PostgreSQL shortens: scheduled_date/scheduled_time -> scheduled_d/scheduled_t)
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
  WHERE conrelid = 'schedule_reminder_sent'::regclass AND contype = 'u' LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE schedule_reminder_sent DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- Ensure unique per (student, course, date, time, minutes_before)
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedule_reminder_sent_unique
  ON schedule_reminder_sent (student_id, course_id, scheduled_date, scheduled_time, reminder_minutes_before);

COMMENT ON COLUMN schedule_reminder_sent.reminder_minutes_before IS '60 = 1 saac kahor, 10 = 10 daqiiqo kahor';
