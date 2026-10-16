# Workflows

This directory contains Markdown SOPs (Standard Operating Procedures) that define how to accomplish objectives in Clipper.

## Purpose

Workflows are the instruction layer of the WAT framework (Workflows, Agents, Tools). Each workflow defines a clear objective, required inputs, which tools to use and in what sequence, and how to handle edge cases.

## Keyword workflows (mandatory)

When the user invokes `CM`, `PD`, `CMPD`, or `CU` (case-insensitive, with or without a leading slash or words like `run`), read `workflows/README.md` and the matching workflow file completely, then execute it. Do not ask what the keyword means.

| Keyword | File | Meaning |
|---|---|---|
| **CM** | [cm.md](cm.md) | Validate (`npm run build`), stage intended files, and commit. |
| **PD** | [pd.md](pd.md) | Sync `main`, push to `origin/main`, deploy to VPS (`tools/deploy.sh`), and verify endpoint. |
| **CMPD** | [cmpd.md](cmpd.md) | Complete code pipeline: validate → commit → push → deploy to VPS → verify endpoint. |
| **CU** | [cu.md](cu.md) | Safely clean merged branches/worktrees, stop local servers, and clean temporary clips/artifacts. |

## Other SOPs

| File | Purpose |
|---|---|
| [deploy.md](deploy.md) | VPS deployment details (`tools/deploy.sh` on `72.61.245.97`) |

## Workflow Template

Each workflow should include:
- **Objective**: What this workflow accomplishes
- **Inputs**: What data or configuration is needed before starting
- **Tools Used**: Which scripts from `tools/` or CLI commands are called
- **Steps**: Numbered, clear instructions for the agent
- **Outputs**: What gets produced and where
- **Edge Cases**: Troubleshooting and recovery
