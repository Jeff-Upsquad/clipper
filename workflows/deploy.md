# Deployment Guide (VPS)

## Overview

Clipper runs on production at **`https://clipper.squadhub.in`**.

- **VPS Host**: `root@72.61.245.97`
- **Application Directory**: `/opt/clipper`
- **Process Manager**: PM2 (`clipper`, process ID 666)
- **Local Port**: `5001` (reverse proxied via Caddy / Nginx to `clipper.squadhub.in`)

## Deployment Command

From the root of the project:
```bash
bash tools/deploy.sh
```

## Manual Deployment Steps

If `tools/deploy.sh` cannot be used:
```bash
ssh root@72.61.245.97 "cd /opt/clipper && git checkout -- package-lock.json 2>/dev/null || true && git pull origin main && npm run build && pm2 restart clipper"
```

## Verifying Deployment

```bash
# 1. Check HTTP response
curl -s -I https://clipper.squadhub.in/

# 2. Check PM2 status
ssh root@72.61.245.97 "pm2 status clipper"

# 3. View live server logs
ssh root@72.61.245.97 "pm2 logs clipper --lines 30 --nostream"
```

## Cookies & Authentication

YouTube requests from datacenter IPs require cookies:
- Cookie file path: `/opt/clipper/cookies.txt` (or `/opt/clipper/server/cookies.txt`)
- File permissions: `600`
- To update cookies:
  ```bash
  scp ~/Downloads/*cookies*.txt root@72.61.245.97:/opt/clipper/cookies.txt
  ssh root@72.61.245.97 "chmod 600 /opt/clipper/cookies.txt && pm2 restart clipper"
  ```
