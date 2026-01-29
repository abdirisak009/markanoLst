#!/bin/bash
# Run on VPS to create gold_student_devices table in PostgreSQL.
# Usage: cd /root/markanoLst && bash scripts/run-054-gold-student-devices-on-vps.sh

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Create .env with DATABASE_URL=postgresql://..."
  exit 1
fi

DATABASE_URL=$(grep '^DATABASE_URL=' .env 2>/dev/null | sed 's/^DATABASE_URL=//' | tr -d '\r"' | head -1)
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Installing postgresql-client..."
  apt-get update -qq && apt-get install -y -qq postgresql-client >/dev/null 2>&1 || true
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql not found. Install with: sudo apt-get install -y postgresql-client"
  exit 1
fi

echo "Running migration: 054-gold-student-devices.sql"
psql "$DATABASE_URL" -f scripts/054-gold-student-devices.sql
echo "Done. Table gold_student_devices created/verified."
psql "$DATABASE_URL" -c "\dt gold_student_devices"
