#!/bin/bash
# One-time: install GitHub Actions self-hosted runner on VPS.
# Run ON THE VPS as root: sudo bash scripts/setup-github-runner-on-vps.sh
#
# Before running:
# 1. GitHub repo → Settings → Actions → Runners → New self-hosted runner
# 2. Copy the token shown there
# 3. Run: sudo GITHUB_RUNNER_TOKEN="YOUR_TOKEN" bash scripts/setup-github-runner-on-vps.sh
#    Or run without token and paste when asked.
#
# After this: push to main will deploy on this VPS (no SSH, no firewall). Disable the old "Deploy to VPS" workflow if you use this.

set -e
REPO_URL="https://github.com/abdirisak009/markanoLst"
RUNNER_DIR="/root/actions-runner"

echo "=== GitHub Actions self-hosted runner (VPS) ==="

if [ -z "$GITHUB_RUNNER_TOKEN" ]; then
  echo "Paste the token from: repo Settings → Actions → Runners → New self-hosted runner"
  read -r GITHUB_RUNNER_TOKEN
fi
if [ -z "$GITHUB_RUNNER_TOKEN" ]; then
  echo "No token. Exit."
  exit 1
fi

# Allow running as root (VPS often is root)
export RUNNER_ALLOW_RUNASROOT=1

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Latest runner version
TAG=$(curl -sL https://api.github.com/repos/actions/runner/releases/latest | grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/')
[ -z "$TAG" ] && TAG="2.321.0"
FILE="actions-runner-linux-x64-${TAG}.tar.gz"
URL="https://github.com/actions/runner/releases/download/v${TAG}/${FILE}"

echo "Downloading runner v${TAG}..."
curl -sL -o "$FILE" "$URL" || { echo "Download failed. Try: curl -sL $URL"; exit 1; }
tar xzf "$FILE"
rm -f "$FILE"

echo "Configuring runner for $REPO_URL..."
./config.sh --url "$REPO_URL" --token "$GITHUB_RUNNER_TOKEN" --name "markano-vps" --unattended

echo "Installing as systemd service..."
./svc.sh install
./svc.sh start

echo "=== Done. Runner is running. Push to main → deploy on this VPS (workflow: Deploy self-hosted). ==="
echo "To disable the old SSH deploy: in repo Settings → Actions → General, or rename/remove .github/workflows/deploy.yml"
