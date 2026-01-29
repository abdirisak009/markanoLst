-- Admin-unblocked IPs: when admin unblocks an IP, it is added here so middleware allows access.
-- Middleware checks this via GET /api/internal/unblock-check?ip=...
CREATE TABLE IF NOT EXISTS admin_unblocked_ips (
  ip TEXT PRIMARY KEY,
  unblocked_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_unblocked_ips IS 'IPs unblocked by admin; middleware allows these IPs even if in-memory block exists';
