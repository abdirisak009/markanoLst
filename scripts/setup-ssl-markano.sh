#!/bin/bash
# SSL setup for markano.tech on VPS (Ubuntu, Nginx, Certbot).
# Run on VPS as root: bash scripts/setup-ssl-markano.sh
# Or from repo root: sudo bash /root/markanoLst/scripts/setup-ssl-markano.sh

set -e

SITES_AVAILABLE="/etc/nginx/sites-available"
SITES_ENABLED="/etc/nginx/sites-enabled"
SITE_NAME="markano.tech"
CONF_FILE="${SITES_AVAILABLE}/${SITE_NAME}"

# --- 1. Inspect Nginx site configs ---
echo "=== 1. Inspect Nginx site configs in ${SITES_AVAILABLE} ==="
ls -la "${SITES_AVAILABLE}" || true
echo "=== Enabled (symlinks in ${SITES_ENABLED}) ==="
ls -la "${SITES_ENABLED}" || true

# --- 2. Backup and write HTTP server block (do NOT overwrite if Certbot already added SSL) ---
echo "=== 2. Backup and install correct HTTP server block ==="
HAS_SSL=false
[ -f "${CONF_FILE}" ] && grep -qE 'listen\s+443|ssl_certificate' "${CONF_FILE}" && HAS_SSL=true

if [ "$HAS_SSL" = true ]; then
  echo "[OK] Nginx config already has SSL (Certbot); keeping existing config"
else
  [ -f "${CONF_FILE}" ] && cp -a "${CONF_FILE}" "${CONF_FILE}.bak.$(date +%s)"
  [ -f "${SITES_AVAILABLE}/default" ] && cp -a "${SITES_AVAILABLE}/default" "${SITES_AVAILABLE}/default.bak.$(date +%s)"

  # Write exactly one server block: listen 80, server_name markano.tech www.markano.tech, proxy to localhost:3000
  cat > "${CONF_FILE}" << 'NGINXEOF'
upstream markano_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name markano.tech www.markano.tech;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    location / {
        proxy_pass http://markano_backend;
        proxy_redirect off;
    }

    location /_next/static {
        proxy_pass http://markano_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF
    mkdir -p /var/www/html
    chown www-data:www-data /var/www/html 2>/dev/null || true
  echo "[OK] Wrote ${CONF_FILE}"
fi

# --- 3. Enable only this site; remove conflicting server blocks from port 80 ---
echo "=== 3. Enable site and disable conflicting blocks ==="
rm -f "${SITES_ENABLED}/default"
rm -f "${SITES_ENABLED}/markano" 2>/dev/null || true
ln -sf "${CONF_FILE}" "${SITES_ENABLED}/${SITE_NAME}"
echo "[OK] Enabled ${SITE_NAME}; removed default and markano from sites-enabled"

# --- 4. Ensure port 443 (and 80) open in firewall ---
echo "=== 4. Firewall (allow 80, 443) ==="
if command -v ufw &>/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
  ufw --force reload 2>/dev/null || true
  echo "[OK] UFW: 80 and 443 allowed"
else
  echo "[SKIP] UFW not active or not installed"
fi

# --- 5. Test Nginx and reload ---
echo "=== 5. Test Nginx configuration and reload ==="
nginx -t
systemctl reload nginx
echo "[OK] Nginx reloaded"

# --- 6. Run Certbot for markano.tech and www.markano.tech ---
echo "=== 6. Run Certbot for SSL (markano.tech, www.markano.tech) ==="
if ! command -v certbot &>/dev/null; then
  echo "[INFO] Installing certbot..."
  apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx >/dev/null 2>&1 || true
fi
if certbot certificates 2>/dev/null | grep -q "markano.tech"; then
  certbot --nginx -d markano.tech -d www.markano.tech --non-interactive --agree-tos --email admin@markano.tech 2>/dev/null || true
  echo "[OK] Certificate already exists"
else
  certbot --nginx -d markano.tech -d www.markano.tech --non-interactive --agree-tos --email admin@markano.tech --redirect
  echo "[OK] Certbot completed"
fi

# --- 6b. FALLBACK: If config still has no listen 443 but cert exists, write full SSL config ---
if ! grep -qE 'listen\s+443' "${CONF_FILE}"; then
  CERT_DIR="/etc/letsencrypt/live/markano.tech"
  if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
    echo "[FALLBACK] No port 443 in config; writing full config (HTTP redirect + HTTPS proxy)"
    cp -a "${CONF_FILE}" "${CONF_FILE}.pre-ssl.$(date +%s)"
    INCLUDE_SSL=""
    DHPARAM_LINE=""
    [ -f /etc/letsencrypt/options-ssl-nginx.conf ] && INCLUDE_SSL="include /etc/letsencrypt/options-ssl-nginx.conf;"
    [ -f /etc/letsencrypt/ssl-dhparams.pem ] && DHPARAM_LINE="ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"
    cat > "${CONF_FILE}" << SSLNGINX
upstream markano_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}
server {
    listen 80;
    listen [::]:80;
    server_name markano.tech www.markano.tech;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name markano.tech www.markano.tech;
    ssl_certificate ${CERT_DIR}/fullchain.pem;
    ssl_certificate_key ${CERT_DIR}/privkey.pem;
    ${INCLUDE_SSL}
    ${DHPARAM_LINE}
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    client_max_body_size 10M;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    location / {
        proxy_pass http://markano_backend;
        proxy_redirect off;
    }
    location /_next/static {
        proxy_pass http://markano_backend;
        add_header Cache-Control "public, immutable";
    }
}
SSLNGINX
    nginx -t && systemctl reload nginx
    echo "[OK] Full SSL config written; nginx reloaded"
  else
    echo "[WARN] No listen 443 and no cert at ${CERT_DIR}. Obtain cert first: certbot certonly --standalone -d markano.tech -d www.markano.tech (stop nginx briefly) or use --webroot."
  fi
else
  echo "[OK] Config already has listen 443"
fi

# --- 7. Verify HTTPS works (local) ---
echo "=== 7. Verify HTTPS (localhost) ==="
if curl -sI -k --max-time 5 https://127.0.0.1 -H "Host: markano.tech" 2>/dev/null | head -1 | grep -qE "200|301|302"; then
  echo "[OK] HTTPS responds on 127.0.0.1"
else
  echo "[WARN] HTTPS not responding locally - check: ss -tlnp | grep 443; nginx -T | grep -A2 listen"
fi

# --- 8. Ensure Certbot auto-renew is enabled ---
echo "=== 8. Certbot auto-renew ==="
if systemctl list-unit-files certbot.timer &>/dev/null; then
  systemctl enable certbot.timer 2>/dev/null || true
  systemctl start certbot.timer 2>/dev/null || true
  echo "[OK] certbot.timer enabled and started"
elif [ -d /etc/letsencrypt/renewal ]; then
  echo "0 0,12 * * * root /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew 2>/dev/null && chmod 644 /etc/cron.d/certbot-renew && echo "[OK] Certbot renew cron installed" || echo "[WARN] Add certbot renew to cron manually"
else
  echo "[OK] Certbot will install renewal config; verify with: certbot renew --dry-run"
fi

echo ""
echo "=== DONE. Verify from outside: curl -sI https://markano.tech ==="
