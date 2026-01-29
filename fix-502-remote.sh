#!/bin/bash
set -e
echo "=== Step 1-2: SSH context - Stopping non-Next.js Node processes (node dist/main) ==="
pkill -f "node dist/main" 2>/dev/null || true
pkill -f "xvfb-run.*node dist" 2>/dev/null || true
sleep 1
# Ensure no node dist/main left
pgrep -f "node dist/main" && (pkill -9 -f "node dist/main" 2>/dev/null; sleep 1) || true
echo "[OK] Killed node dist/main processes"

echo ""
echo "=== Step 3: Navigate to ~/markanoLst ==="
cd ~/markanoLst || { echo "ERROR: ~/markanoLst not found"; exit 1; }
echo "[OK] In $(pwd)"

echo ""
echo "=== Step 4: Verify/create .env (DATABASE_URL, NODE_ENV=production) ==="
if [ ! -f .env ]; then touch .env; fi
if ! grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  if [ -f .env.local ] && grep -q '^DATABASE_URL=' .env.local 2>/dev/null; then
    grep '^DATABASE_URL=' .env.local >> .env
  else
    echo "ERROR: .env must contain DATABASE_URL. Add your Neon PostgreSQL URL and re-run."
    exit 1
  fi
fi
grep -q '^NODE_ENV=' .env 2>/dev/null && sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env || echo 'NODE_ENV=production' >> .env
echo "[OK] .env has DATABASE_URL and NODE_ENV=production"

echo ""
echo "=== Step 5: npm install ==="
# Install all deps including devDependencies (needed for build)
NPM_CONFIG_PRODUCTION=false npm install
echo "[OK] Dependencies installed"

echo ""
echo "=== Step 6: npm run build ==="
npm run build
echo "[OK] Build completed"

echo ""
echo "=== Step 7: Test npm start on port 3000 ==="
# Start in background, wait for listen, then stop
npm start &
NPID=$!
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 2>/dev/null | grep -q '200\|301\|302'; then
    echo "[OK] App is listening on port 3000"
    break
  fi
  sleep 1
done
kill $NPID 2>/dev/null || true
sleep 2
echo "[OK] Test run stopped"

echo ""
echo "=== Step 8: PM2 start (markano-next), save, startup ==="
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 delete markano-next 2>/dev/null || true
cd ~/markanoLst
pm2 start npm --name "markano-next" -- start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup
echo "[OK] PM2 process markano-next started and saved"

echo ""
echo "=== Step 9: Verify app on port 3000 ==="
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 || true
PORT=$(ss -tlnp 2>/dev/null | grep ':3000 ' || netstat -tlnp 2>/dev/null | grep ':3000 ' || true)
echo "Port 3000 check: $PORT"
echo "[OK] Verification done"

echo ""
echo "=== Step 10: Nginx config and reload ==="
NGINX_SITE="/etc/nginx/sites-available/default"
if [ -f "$NGINX_SITE" ]; then
  if ! grep -q 'proxy_pass.*127.0.0.1:3000\|proxy_pass.*localhost:3000' "$NGINX_SITE" 2>/dev/null; then
    echo "Adding proxy_pass to Nginx config..."
    # Backup and ensure location / proxies to 3000
    sed -i.bak 's|proxy_pass http://[^;]*;|proxy_pass http://127.0.0.1:3000;|g' "$NGINX_SITE" 2>/dev/null || true
  fi
fi
nginx -t && systemctl reload nginx
echo "[OK] Nginx tested and reloaded"

echo ""
echo "=== Step 11: Test website (no 502) ==="
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 2>/dev/null || echo "000")
echo "Local 3000 HTTP code: $HTTP"
HTTP80=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80 2>/dev/null || echo "000")
echo "Via Nginx (port 80) HTTP code: $HTTP80"
if [ "$HTTP80" = "502" ]; then
  echo "--- pm2 logs markano-next (last 50 lines) ---"
  pm2 logs markano-next --lines 50 --nostream
  echo "--- /var/log/nginx/error.log (last 30 lines) ---"
  tail -30 /var/log/nginx/error.log
  exit 1
fi
echo "[OK] 502 resolved - site responding"

echo ""
echo "=== All steps completed. Next.js on PM2, Nginx proxying, 502 fixed. ==="
