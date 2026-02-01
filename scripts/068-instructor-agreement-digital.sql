-- ====================================================
-- Digital Instructor Agreement System
-- ====================================================
-- Tables: instructor_agreement_versions (platform-wide versions),
--         instructor_agreement_acceptances (audit log).
-- instructors: add accepted_agreement_version_id.
-- ====================================================

-- Agreement versions (v1.0, v1.1, v2.0): one active at a time
CREATE TABLE IF NOT EXISTS instructor_agreement_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  content_html TEXT,
  content_text TEXT,
  pdf_url VARCHAR(500),
  pdf_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT false,
  force_reaccept BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_agreement_versions_active ON instructor_agreement_versions(is_active) WHERE is_active = true;
COMMENT ON TABLE instructor_agreement_versions IS 'Platform-wide agreement versions; one is_active=true. force_reaccept=true requires all instructors to re-accept.';

-- Acceptance log: legally binding, auditable
CREATE TABLE IF NOT EXISTS instructor_agreement_acceptances (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  agreement_version_id INTEGER NOT NULL REFERENCES instructor_agreement_versions(id) ON DELETE CASCADE,
  version_string VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'digital',
  content_snapshot TEXT,
  accepted_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_agreement_acceptances_instructor ON instructor_agreement_acceptances(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_agreement_acceptances_version ON instructor_agreement_acceptances(agreement_version_id);
CREATE INDEX IF NOT EXISTS idx_instructor_agreement_acceptances_accepted_at ON instructor_agreement_acceptances(accepted_at_utc DESC);
COMMENT ON TABLE instructor_agreement_acceptances IS 'Audit log of instructor agreement acceptances; source: digital | pdf-based.';

-- Link instructor to the version they accepted (quick check for enforcement)
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS accepted_agreement_version_id INTEGER REFERENCES instructor_agreement_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_instructors_accepted_agreement_version ON instructors(accepted_agreement_version_id);
COMMENT ON COLUMN instructors.accepted_agreement_version_id IS 'Last agreement version accepted; NULL if not accepted or must re-accept.';

-- Seed first digital agreement version (admin can edit via panel)
INSERT INTO instructor_agreement_versions (version, content_html, content_text, is_active, force_reaccept)
SELECT '1.0',
  '<h2>Instructor Agreement</h2><p>By accepting this agreement, you agree to the following terms governing your participation as an instructor on this platform.</p><h3>1. Revenue Share</h3><p>Your revenue share percentage will be set by the platform and communicated to you. Payments are processed according to the payout policy.</p><h3>2. Content & Conduct</h3><p>You are responsible for the accuracy and quality of your course content. You agree not to publish misleading, infringing, or inappropriate material.</p><h3>3. Intellectual Property</h3><p>You retain ownership of your original content. You grant the platform a license to host, display, and distribute your content to enrolled students.</p><h3>4. Updates</h3><p>When the agreement is updated, you may be required to re-accept. You will be notified and must accept before continuing to publish or monetize.</p><p><strong>By clicking "Accept & Continue" you confirm that you have read and agree to this Instructor Agreement.</strong></p>',
  'Instructor Agreement. Revenue share, content responsibility, IP license, updates. By accepting you confirm you have read and agree.',
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM instructor_agreement_versions WHERE version = '1.0');
