# CU — Cleanup after Session / CMPD

## Objective

Safely clean up temporary files, test clips, and development processes created in the current session both locally and on the VPS.

## Scope Rule

CU only cleans resources belonging to the current session or disposable temporary artifacts (e.g. test video clips in `server/public/clips/`). It never deletes unmerged code or touches other projects sharing the VPS (e.g. SquadHub, Attendease, Profiles).

## Authorization Rule

Invoking `CU` authorizes the cleanup described here. No additional confirmation is needed to remove session-owned temporary files, test clips, or stopped development servers.

## Steps

1. **Local Git & Branch Cleanup**:
   - If a feature branch or worktree was created for this session and has been merged into `main`:
     ```bash
     git branch -d <branch>
     ```
   - Clean any untracked temporary files (excluding `.env`, `cookies.txt`, or project code).
2. **Local Server Cleanup**:
   - Stop any local background development servers started during this session (e.g. processes on port `5001` or `5173`).
3. **Clip & Storage Cleanup**:
   - Clean local test clips in `server/public/clips/` older than 1 hour or created during testing (preserve `.gitkeep`).
   - Clean VPS test clips in `/opt/clipper/server/public/clips/` older than 1 day to prevent disk bloat:
     ```bash
     ssh -o BatchMode=yes root@72.61.245.97 "find /opt/clipper/server/public/clips -type f ! -name '.gitkeep' -mtime +1 -delete 2>/dev/null || true"
     ```
4. **Report**:
   - Report all stopped servers, deleted branches, and reclaimed storage to the user.

## Safety & Edge Cases

- Never delete uncommitted work or unmerged branches without explicit user instruction.
- Never run blanket Docker or system prunes on the VPS, as other production applications share the server.
