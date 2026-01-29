#!/bin/bash
# Run on VPS to verify SSL: bash scripts/verify-ssl-vps.sh
# Diagnoses why HTTPS might not work (config, port 443, cert, firewall).

set -e

echo "=== 1. Nginx config test ==="
nginx -t 2>&1 || { echo "FAIL: nginx -t"; exit 1; }

echo ""
echo "=== 2. Sites enabled ==="
ls -la /etc/nginx/sites-enabled/

echo ""
echo "=== 3. Does markano.tech config have SSL? ==="
CONF="/etc/nginx/sites-available/markano.tech"
if [ -f "$CONF" ]; then
  if grep -qE 'listen\s+443|ssl_certificate' "$CONF"; then
    echo "[OK] Config contains listen 443 / ssl_certificate"
    grep -E 'listen\s+443|ssl_certificate|server_name' "$CONF" | head -10
  else
    echo "[FAIL] No SSL in config - run: sudo bash scripts/setup-ssl-markano.sh"
  fi
else
  echo "[FAIL] $CONF not found"
fi

echo ""
echo "=== 4. Port 443 listening? ==="
ss -tlnp | grep -E ':443|:80' || true

echo ""
echo "=== 5. Certbot certificates (markano.tech) ==="
certbot certificates 2>/dev/null | grep -A5 "markano.tech" || echo "No cert for markano.tech - run setup-ssl-markano.sh"

echo ""
echo "=== 6. HTTPS from localhost ==="
curl -sI -k --max-time 5 https://127.0.0.1 -H "Host: markano.tech" 2>&1 | head -3 || echo "curl failed"

echo ""
echo "=== 7. Firewall (UFW) ==="
if command -v ufw &>/dev/null; then
  ufw status 2>/dev/null | grep -E "443|80|Status" || true
else
  echo "ufw not installed"
fi

echo ""
echo "=== 8. From outside run: curl -sI https://markano.tech ==="
