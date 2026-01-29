-- ====================================================
-- Instructor Applications & Instructors: delete support
-- ====================================================
-- Ensure deleted_at exists on both tables and add index for filtering.
-- Labadaba: instructor_applications iyo instructors.
-- ====================================================

-- instructor_applications: add deleted_at if missing, then index
ALTER TABLE instructor_applications
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_instructor_applications_deleted
  ON instructor_applications(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON COLUMN instructor_applications.deleted_at IS 'Soft delete; NULL = active';

-- instructors: add deleted_at if missing, then index
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_instructors_deleted
  ON instructors(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON COLUMN instructors.deleted_at IS 'Soft delete; NULL = active';
