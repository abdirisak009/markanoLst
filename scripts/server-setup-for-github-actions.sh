#!/bin/bash
# One-time server setup for GitHub Actions deploy
# Run on VPS as root: bash scripts/server-setup-for-github-actions.sh
# Prerequisite: SSH key already created on server (e.g. ~/.ssh/id_rsa)

set -e
echo "=== Server setup for GitHub Actions ==="

# 1) Ensure GitHub can SSH in: public key must be in authorized_keys
if [ -f ~/.ssh/id_rsa.pub ]; then
  mkdir -p ~/.ssh
  touch ~/.ssh/authorized_keys
  grep -qF "$(cat ~/.ssh/id_rsa.pub)" ~/.ssh/authorized_keys || cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  echo "[OK] Public key added to authorized_keys (for GitHub Actions SSH)"
else
  echo "[SKIP] No ~/.ssh/id_rsa.pub – create key with: ssh-keygen -t rsa -N '' -f ~/.ssh/id_rsa"
  echo "       Then copy ~/.ssh/id_rsa (private) into GitHub repo Secrets as SSH_PRIVATE_KEY"
fi

# 2) Ensure project dir is a git clone
if [ ! -d /root/markanoLst/.git ]; then
  echo "Cloning repo to /root/markanoLst..."
  cd /root
  [ -d markanoLst ] && mv markanoLst markanoLst.bak.$(date +%s)
  git clone https://github.com/abdirisak009/markanoLst.git markanoLst
  cd markanoLst
  echo "[OK] Repo cloned"
else
  cd /root/markanoLst
  echo "[OK] Already a git repo"
fi

# 3) .env must exist (DATABASE_URL, NODE_ENV=production)
if [ ! -f .env ]; then
  touch .env
  echo "NODE_ENV=production" >> .env
  echo "[WARN] .env created – add DATABASE_URL (and other vars) then re-run build/deploy"
else
  grep -q NODE_ENV .env || echo "NODE_ENV=production" >> .env
  echo "[OK] .env present"
fi

# 4) PM2 startup on boot (if not already)
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "[OK] PM2 startup configured"

echo "=== Setup done. Add GitHub Secrets (SSH_HOST, SSH_USER, SSH_PRIVATE_KEY) and push to main. ==="
