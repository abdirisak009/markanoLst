-- ====================================================
-- Markano Professional Teacher / Instructor System
-- ====================================================
-- Tables: instructors, instructor_applications, instructor_documents,
--         instructor_university_links, instructor_activity_logs
-- Integration: learning_courses.instructor_id
-- ====================================================

-- ====================================================
-- 1. INSTRUCTOR APPLICATIONS (before approval)
-- ====================================================
CREATE TABLE IF NOT EXISTS instructor_applications (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  cv_url VARCHAR(500),
  cv_file_name VARCHAR(255),
  proposed_courses TEXT,
  bio TEXT,
  experience_years INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  changes_requested_message TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_instructor_applications_status ON instructor_applications(status);
CREATE INDEX IF NOT EXISTS idx_instructor_applications_email ON instructor_applications(email);
CREATE INDEX IF NOT EXISTS idx_instructor_applications_created ON instructor_applications(created_at DESC);
COMMENT ON TABLE instructor_applications IS 'Teacher applications; pending/approved/rejected/changes_requested';

-- ====================================================
-- 2. INSTRUCTORS (approved teachers)
-- ====================================================
CREATE TABLE IF NOT EXISTS instructors (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES instructor_applications(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  profile_image_url VARCHAR(500),
  bio TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_created ON instructors(created_at DESC);
COMMENT ON TABLE instructors IS 'Approved teachers; status: active | suspended';

-- ====================================================
-- 3. INSTRUCTOR DOCUMENTS (CV, agreements)
-- ====================================================
CREATE TABLE IF NOT EXISTS instructor_documents (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_documents_instructor ON instructor_documents(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_documents_type ON instructor_documents(instructor_id, document_type);
COMMENT ON TABLE instructor_documents IS 'CV, agreements; document_type: cv | agreement';

-- ====================================================
-- 4. INSTRUCTOR UNIVERSITY LINKS
-- ====================================================
CREATE TABLE IF NOT EXISTS instructor_university_links (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'instructor',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instructor_id, university_id)
);

CREATE INDEX IF NOT EXISTS idx_instructor_university_links_instructor ON instructor_university_links(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_university_links_university ON instructor_university_links(university_id);
COMMENT ON TABLE instructor_university_links IS 'Link teacher to university for university-scoped students';

-- ====================================================
-- 5. INSTRUCTOR ACTIVITY LOGS (audit)
-- ====================================================
CREATE TABLE IF NOT EXISTS instructor_activity_logs (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  metadata JSONB,
  ip VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_activity_logs_instructor ON instructor_activity_logs(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_activity_logs_created ON instructor_activity_logs(created_at DESC);
COMMENT ON TABLE instructor_activity_logs IS 'Audit log for instructor actions';

-- ====================================================
-- 6. LINK LEARNING_COURSES TO INSTRUCTOR
-- ====================================================
ALTER TABLE learning_courses
  ADD COLUMN IF NOT EXISTS instructor_id INTEGER REFERENCES instructors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_learning_courses_instructor ON learning_courses(instructor_id);

-- Application documents (CV stored at application time; optional duplicate in instructor_documents after approval)
CREATE TABLE IF NOT EXISTS instructor_application_documents (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES instructor_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL DEFAULT 'cv',
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_app_docs_application ON instructor_application_documents(application_id);
