#!/bin/bash
# ====================================================
# MinIO Object Storage - VPS Setup
# ====================================================
# Run on your VPS to install MinIO and create bucket for Markano.
# Instructor profile images (and other uploads) will be stored here when USE_MINIO=true.
# ====================================================

set -e

MINIO_USER="${MINIO_USER:-minioadmin}"
MINIO_PASSWORD="${MINIO_PASSWORD:-minioadmin}"
MINIO_DATA_DIR="${MINIO_DATA_DIR:-/opt/minio/data}"
MINIO_BUCKET="${MINIO_BUCKET:-markano}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"

echo "=== MinIO VPS Setup ==="
echo "Data dir: $MINIO_DATA_DIR"
echo "Bucket: $MINIO_BUCKET"
echo "API port: $MINIO_PORT"
echo "Console port: $MINIO_CONSOLE_PORT"
echo ""

# 1. Create data directory
sudo mkdir -p "$MINIO_DATA_DIR"
sudo chown -R "$(whoami)" "$MINIO_DATA_DIR" 2>/dev/null || true

# 2. Download MinIO binary (Linux amd64)
MINIO_BIN="/usr/local/bin/minio"
if [ ! -f "$MINIO_BIN" ]; then
  echo "Downloading MinIO..."
  curl -sL "https://dl.min.io/server/minio/release/linux-amd64/minio" -o /tmp/minio
  chmod +x /tmp/minio
  sudo mv /tmp/minio "$MINIO_BIN"
  echo "MinIO installed at $MINIO_BIN"
else
  echo "MinIO already installed at $MINIO_BIN"
fi

# 3. Create systemd service
sudo tee /etc/systemd/system/minio.service > /dev/null << EOF
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=root
Group=root
Environment="MINIO_ROOT_USER=$MINIO_USER"
Environment="MINIO_ROOT_PASSWORD=$MINIO_PASSWORD"
ExecStart=$MINIO_BIN server $MINIO_DATA_DIR --console-address ":$MINIO_CONSOLE_PORT"
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl restart minio
echo "MinIO service started. Check: sudo systemctl status minio"

# 4. Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 5

# 5. Install mc (MinIO Client) and create bucket
MC_BIN="/usr/local/bin/mc"
if [ ! -f "$MC_BIN" ]; then
  echo "Downloading MinIO Client (mc)..."
  curl -sL "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /tmp/mc
  chmod +x /tmp/mc
  sudo mv /tmp/mc "$MC_BIN"
fi

"$MC_BIN" alias set local "http://127.0.0.1:$MINIO_PORT" "$MINIO_USER" "$MINIO_PASSWORD" 2>/dev/null || true
"$MC_BIN" mb "local/$MINIO_BUCKET" --ignore-existing 2>/dev/null || true
"$MC_BIN" anonymous set download "local/$MINIO_BUCKET" 2>/dev/null || true
echo "Bucket '$MINIO_BUCKET' created and set to public read (download)."

echo ""
echo "=== Done ==="
echo "MinIO API:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'VPS_IP'):$MINIO_PORT"
echo "MinIO Console: http://$(curl -s ifconfig.me 2>/dev/null || echo 'VPS_IP'):$MINIO_CONSOLE_PORT"
echo ""
echo "Add to your app .env (on the server or in your deploy):"
echo "  MINIO_ENDPOINT=http://127.0.0.1:$MINIO_PORT"
echo "  MINIO_ACCESS_KEY=$MINIO_USER"
echo "  MINIO_SECRET_KEY=$MINIO_PASSWORD"
echo "  MINIO_BUCKET=$MINIO_BUCKET"
echo "  MINIO_PUBLIC_URL=http://YOUR_VPS_IP_OR_DOMAIN:$MINIO_PORT/$MINIO_BUCKET"
echo ""
echo "If you put Nginx in front of MinIO (recommended for HTTPS), set:"
echo "  MINIO_PUBLIC_URL=https://minio.yourdomain.com/$MINIO_BUCKET"
echo ""
