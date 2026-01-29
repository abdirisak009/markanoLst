-- ====================================================
-- Store agreement PDF in DB when MinIO is unavailable
-- ====================================================
-- instructor_documents: add file_content BYTEA for inline PDF storage.
-- When file_url = 'data:db', the PDF is in file_content; instructor fetches via API.
-- ====================================================

ALTER TABLE instructor_documents
  ADD COLUMN IF NOT EXISTS file_content BYTEA DEFAULT NULL;

COMMENT ON COLUMN instructor_documents.file_content IS 'PDF bytes when stored in DB (file_url = data:db); NULL when file is in MinIO.';
