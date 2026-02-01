-- ====================================================
-- Agreement: Somali & Arabic content (3 languages)
-- ====================================================
-- content_html = English (existing), content_html_so = Somali, content_html_ar = Arabic.
-- ====================================================

ALTER TABLE instructor_agreement_versions
  ADD COLUMN IF NOT EXISTS content_html_so TEXT DEFAULT NULL;

ALTER TABLE instructor_agreement_versions
  ADD COLUMN IF NOT EXISTS content_html_ar TEXT DEFAULT NULL;

COMMENT ON COLUMN instructor_agreement_versions.content_html_so IS 'Agreement content HTML (Somali).';
COMMENT ON COLUMN instructor_agreement_versions.content_html_ar IS 'Agreement content HTML (Arabic).';
