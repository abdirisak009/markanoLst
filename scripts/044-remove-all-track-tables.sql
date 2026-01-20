-- Remove All Track-Related Tables from Markano Gold
-- ====================================================
-- This script drops all database tables related to tracks, lessons, modules, levels, etc.
-- KEEP ONLY: gold_students (for login/register functionality)
--
-- WARNING: This will permanently delete all track-related data!
-- Make sure to backup your database before running this script.

-- Drop tables in reverse dependency order (child tables first, then parent tables)

-- 1. Drop exercise submissions (depends on exercises and students)
DROP TABLE IF EXISTS gold_exercise_submissions CASCADE;

-- 2. Drop lesson progress (depends on lessons and students)
DROP TABLE IF EXISTS gold_lesson_progress CASCADE;

-- 3. Drop level progress (depends on levels and students)
DROP TABLE IF EXISTS gold_level_progress CASCADE;

-- 4. Drop level requests (depends on levels and students)
DROP TABLE IF EXISTS gold_level_requests CASCADE;

-- 5. Drop student activity (may reference tracks/lessons)
DROP TABLE IF EXISTS gold_student_activity CASCADE;

-- 6. Drop track applications (depends on tracks and students)
DROP TABLE IF EXISTS gold_track_applications CASCADE;

-- 7. Drop enrollments (depends on tracks, levels, and students)
DROP TABLE IF EXISTS gold_enrollments CASCADE;

-- 8. Drop exercises (depends on levels)
DROP TABLE IF EXISTS gold_exercises CASCADE;

-- 9. Drop lessons (depends on levels and modules)
DROP TABLE IF EXISTS gold_lessons CASCADE;

-- 10. Drop levels (depends on tracks and modules)
DROP TABLE IF EXISTS gold_levels CASCADE;

-- 11. Drop modules (depends on tracks)
DROP TABLE IF EXISTS gold_modules CASCADE;

-- 12. Drop tracks (parent table)
DROP TABLE IF EXISTS gold_tracks CASCADE;

-- Drop indexes if they exist (some may have been dropped with tables)
DROP INDEX IF EXISTS idx_gold_enrollments_student;
DROP INDEX IF EXISTS idx_gold_enrollments_track;
DROP INDEX IF EXISTS idx_gold_level_progress_student;
DROP INDEX IF EXISTS idx_gold_lesson_progress_student;
DROP INDEX IF EXISTS idx_gold_applications_status;
DROP INDEX IF EXISTS idx_gold_modules_track_id;
DROP INDEX IF EXISTS idx_gold_modules_order;
DROP INDEX IF EXISTS idx_gold_levels_module_id;

-- Note: gold_students table is KEPT for login/register functionality
