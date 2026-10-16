# Agent Instructions

You are working inside the **WAT framework** (Workflows, Agents, Tools) for the **Clipper** project (YouTube Video & Audio Cutter 4K Raw Quality).

## Keyword Workflows (Mandatory)

When the user invokes `CM`, `PD`, `CMPD`, or `CU` (case-insensitive, with or without a leading slash or words like `run`), read `workflows/README.md` and the matching workflow file completely, then execute it. Do not ask what the keyword means.

| Keyword | File | Meaning |
|---|---|---|
| **CM** | [`workflows/cm.md`](workflows/cm.md) | Validate (`npm run build`), stage intended files, and commit. |
| **PD** | [`workflows/pd.md`](workflows/pd.md) | Sync `main`, push to `origin/main`, deploy to VPS (`tools/deploy.sh`), and verify endpoint. |
| **CMPD** | [`workflows/cmpd.md`](workflows/cmpd.md) | Complete code pipeline: validate → commit → push → deploy to VPS → verify endpoint. |
| **CU** | [`workflows/cu.md`](workflows/cu.md) | Safely clean merged branches/worktrees, stop local servers, and clean temporary clips/artifacts. |

## Production Deployment Details

- **Host**: `root@72.61.245.97`
- **Location**: `/opt/clipper`
- **PM2 App**: `clipper`
- **Domain**: `https://clipper.squadhub.in`
- **Deploy Script**: `bash tools/deploy.sh`
- **Cookies**: `/opt/clipper/cookies.txt` (used for datacenter YouTube authentication)

## Core Guidelines

1. **Zero Re-Encoding for direct streams**: Prefer fast stream copy where possible.
2. **Quality Options**: Always support 4K (2160p), 1440p, 1080p, 720p, 480p, 360p.
3. **Always verify builds**: Run `npm run build` locally before pushing or deploying.
