# PD — Push & Deploy

## Objective

Push committed changes on `main` to `origin/main` and deploy directly to the production VPS (`clipper.squadhub.in`), then verify the live endpoint.

## Steps

1. Verify local checkout is clean and up to date:
   ```bash
   git status
   ```
2. Push commits to remote:
   ```bash
   git push origin main
   ```
3. Run the automated VPS deployment:
   ```bash
   bash tools/deploy.sh
   ```
   *(Or manual fallback)*:
   ```bash
   ssh root@72.61.245.97 "cd /opt/clipper && git checkout -- package-lock.json 2>/dev/null || true && git pull origin main && npm run build && pm2 restart clipper"
   ```
4. Verify the live production deployment:
   - Check HTTP status:
     ```bash
     curl -s -I https://clipper.squadhub.in/ | grep -iE 'HTTP|content-type'
     ```
   - Check PM2 status:
     ```bash
     ssh root@72.61.245.97 "pm2 describe clipper | grep -E 'status|uptime'"
     ```
5. Report the commit pushed, deployment status, and endpoint response.

## Safety & Edge Cases

- If push is rejected, pull with rebase or fast-forward, re-verify, then push.
- If remote build fails on VPS, inspect `pm2 logs clipper --lines 30` to identify the issue.
