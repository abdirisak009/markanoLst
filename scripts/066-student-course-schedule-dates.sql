-- Add course period (from date – to date) to student_course_schedule.
-- Schedule JSONB can now store per-day { start: "09:00", end: "11:00" } instead of single time.

ALTER TABLE student_course_schedule
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

COMMENT ON COLUMN student_course_schedule.start_date IS 'Taarikhda bilaabashada koorsada (from date)';
COMMENT ON COLUMN student_course_schedule.end_date IS 'Taarikhda dhamaystirka koorsada (to date)';
