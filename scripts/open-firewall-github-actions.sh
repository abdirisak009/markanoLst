#!/bin/bash
# Open SSH port (22) for GitHub Actions IPs on your VPS.
# Run ON THE VPS as root: sudo bash scripts/open-firewall-github-actions.sh
# Or from project dir: sudo bash /root/markanoLst/scripts/open-firewall-github-actions.sh
#
# Fixes: "ssh: connect to host *** port 22: Connection timed out" in GitHub Actions.

set -e
# Usage: sudo bash open-firewall-github-actions.sh [port] [-y]
SSH_PORT="22"
AUTO_RELOAD=""
for arg in "$@"; do
  case "$arg" in
    -y) AUTO_RELOAD=1 ;;
    [0-9]*) SSH_PORT="$arg" ;;
  esac
done

echo "=== Open firewall for GitHub Actions (port $SSH_PORT) ==="

# Fetch GitHub Actions IP ranges
META_URL="https://api.github.com/meta"
if ! command -v curl >/dev/null 2>&1; then
  echo "Install curl: apt-get update && apt-get install -y curl"
  exit 1
fi

JSON=$(curl -sL "$META_URL")
if [ -z "$JSON" ]; then
  echo "Could not fetch $META_URL. Check VPS internet."
  exit 1
fi

# Parse "actions" array: get CIDR blocks (simple grep/sed; works without jq)
# Format in JSON: "actions": ["1.2.3.4/5", "6.7.8.9/10"]
CIDRS=$(echo "$JSON" | sed -n '/"actions"/,/\]/p' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/[0-9]+' || true)
if [ -z "$CIDRS" ]; then
  # Fallback: try Python
  CIDRS=$(python3 -c "
import json, urllib.request
d = json.load(urllib.request.urlopen('$META_URL'))
for c in d.get('actions', []): print(c)
" 2>/dev/null || true)
fi

if [ -z "$CIDRS" ]; then
  echo "Could not parse GitHub Actions IPs. Allow all for testing: sudo ufw allow 22/tcp && sudo ufw reload"
  exit 1
fi

# Prefer ufw; fallback to iptables
if command -v ufw >/dev/null 2>&1; then
  for cidr in $CIDRS; do
    ufw allow from "$cidr" to any port "$SSH_PORT" comment "GitHub Actions" 2>/dev/null || true
  done
  ufw status numbered | head -30
  if [ -n "$AUTO_RELOAD" ]; then
    ufw reload
  else
    echo "Reload ufw? (y/n)"
    read -r ans
    [ "$ans" = "y" ] && ufw reload
  fi
  echo "Done. Port $SSH_PORT is open for GitHub Actions IPs."
elif command -v iptables >/dev/null 2>&1; then
  for cidr in $CIDRS; do
    iptables -A INPUT -p tcp -s "$cidr" --dport "$SSH_PORT" -j ACCEPT
  done
  echo "iptables rules added. Save them (e.g. iptables-save) if your distro persists rules."
else
  echo "No ufw or iptables found. Add firewall rules manually for these CIDRs (port $SSH_PORT):"
  echo "$CIDRS"
fi
