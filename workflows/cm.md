# CM — Commit

## Objective

Validate, stage, and commit changes cleanly. Does not push or deploy. This is the first step of `CMPD`.

## Steps

1. Inspect `git status`, branch, and diff:
   ```bash
   git status
   git diff
   ```
2. Confirm there are changes worth committing. If there are none, report that and stop.
3. Run verification before committing:
   ```bash
   npm run build
   ```
   Fix any syntax or build errors before staging.
4. Stage only intended files and commit with an imperative message:
   ```bash
   git add <files>
   git commit -m "<type>: <imperative summary>"
   ```
5. Report the commit hash and summary. Do not push or deploy — `CMPD` or `PD` handles the rest.

## Safety & Edge Cases

- Never commit secrets (`.env`, private keys, authentication tokens). Note: `cookies.txt` is already in `.gitignore`.
- If `npm run build` fails, do not commit — fix errors first.
