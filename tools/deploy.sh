#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@72.61.245.97}"
VPS_DIR="${VPS_DIR:-/opt/clipper}"

echo "=================================================="
echo "==> Deploying Clipper to VPS ($VPS_HOST)..."
echo "=================================================="

ssh -o BatchMode=yes "$VPS_HOST" "cd $VPS_DIR && git checkout -- package-lock.json 2>/dev/null || true && git pull origin main && npm run build && pm2 restart clipper"

echo "==> Verifying live production endpoint..."
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clipper.squadhub.in/ || true)
if [[ "$STATUS" == "200" || "$STATUS" == "304" ]]; then
  echo "==> Deployment SUCCESS! Status HTTP $STATUS at https://clipper.squadhub.in"
else
  echo "==> Warning: Endpoint returned HTTP $STATUS"
fi
