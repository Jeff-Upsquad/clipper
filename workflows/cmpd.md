# CMPD — Commit, Push, Deploy

## Objective

Run the full end-to-end pipeline: validate changes, stage and commit, push to `origin/main`, deploy to the production VPS (`clipper.squadhub.in`), and verify the live endpoint.

## Steps

1. **Validate & Build**:
   ```bash
   npm run build
   ```
2. **Commit (Execute [cm.md](cm.md))**:
   Stage intended files and commit with a concise imperative message:
   ```bash
   git add <files>
   git commit -m "<type>: <imperative summary>"
   ```
3. **Push & Deploy (Execute [pd.md](pd.md))**:
   Push to `origin/main` and run deployment:
   ```bash
   git push origin main
   bash tools/deploy.sh
   ```
4. **Verify Live Endpoint**:
   Ensure `https://clipper.squadhub.in/` responds with HTTP 200/304 and PM2 `clipper` is online.
5. **Handoff**:
   Summarize the commit hash, changes pushed, deployment confirmation, and prompt the user to hard-refresh (`Cmd + Shift + R`) their browser if frontend assets changed.

## Safety & Edge Cases

- If there are no uncommitted changes and local `main` matches `origin/main`, check if VPS needs deployment (`bash tools/deploy.sh`).
- If build fails, fix errors locally before committing or deploying.
