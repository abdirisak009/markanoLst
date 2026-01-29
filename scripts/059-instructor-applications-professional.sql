-- ====================================================
-- Instructor Applications: Professional / CV fields
-- ====================================================
-- Adds structured professional data columns to instructor_applications
-- for wizard form: job experience, education, previous roles, skills, etc.
-- ====================================================

ALTER TABLE instructor_applications
  ADD COLUMN IF NOT EXISTS job_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS previous_roles TEXT,
  ADD COLUMN IF NOT EXISTS skills_certifications TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);

COMMENT ON COLUMN instructor_applications.job_experience_years IS 'Total years of job/professional experience';
COMMENT ON COLUMN instructor_applications.education IS 'Degree(s) and institution(s)';
COMMENT ON COLUMN instructor_applications.previous_roles IS 'Previous job titles and companies';
COMMENT ON COLUMN instructor_applications.skills_certifications IS 'Key skills and certifications';
COMMENT ON COLUMN instructor_applications.linkedin_url IS 'LinkedIn profile URL';
