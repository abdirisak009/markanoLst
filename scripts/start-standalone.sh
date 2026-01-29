#!/bin/bash
# Start Next.js standalone server (used by PM2 on VPS)
# Run from project root: ./scripts/start-standalone.sh
cd "$(dirname "$0")/../.next/standalone" || exit 1
export PORT=${PORT:-3000}
export NODE_ENV=production
exec node server.js
