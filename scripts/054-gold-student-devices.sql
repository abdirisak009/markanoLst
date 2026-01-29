-- Gold student device limit: max 2 devices per student.
-- Only those 2 devices can log in; others blocked until admin removes a device.

CREATE TABLE IF NOT EXISTS gold_student_devices (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_label VARCHAR(255),
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_gold_student_devices_student_id ON gold_student_devices(student_id);
CREATE INDEX IF NOT EXISTS idx_gold_student_devices_device_id ON gold_student_devices(device_id);

COMMENT ON TABLE gold_student_devices IS 'Max 2 devices per student; only these can log in. Admin can remove one to allow a new device.';
