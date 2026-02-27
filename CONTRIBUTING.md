# Contributing Guide

This repository is a hackathon MVP. The goal is **speed + stability**, not perfect engineering.  
Please follow these rules to avoid breaking the demo.

---

## 1) Ground Rules
- **Do not commit secrets** (tokens, API keys, Google credentials).
  - `.env` must stay local and is ignored by git.
  - Use `.env.example` for variable names only.
- Keep changes **small and reviewable**.
- Prefer **working end-to-end** over adding new features.

---

## 2) How to Work
### 2.1 Branch naming
Use short, clear branch names:
- `feature/bot-flow`
- `feature/apps-script-notify`
- `feature/web-form`
- `fix/status-notifications`
- `chore/docs-update`

### 2.2 Commit messages
Use simple prefixes:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` tooling / refactor / cleanup

Examples:
- `feat: add location choice (geo or manual address)`
- `fix: prevent duplicate notifications on status edits`

---

## 3) Pull Requests (PR)
Before opening a PR:
- Make sure your code starts and runs locally.
- Update docs if you changed:
  - sheet columns / enums (`docs/SHEET_SCHEMA.md`)
  - environment variables (`docs/ENVIRONMENT.md`)
  - architecture (`docs/ARCHITECTURE.md`)

PR description should include:
- What changed (1–3 bullets)
- How to test (exact steps)
- Any demo impact

---

## 4) Testing Checklist (MVP)
Your change must not break these flows:
1. **Create request** (Telegram) → row appears in Google Sheets
2. **Operator changes status** in Sheets → citizen gets Telegram notification
3. **My requests** shows updated status

If you add optional AI:
- Low confidence → `category = Unsorted`

---

## 5) Code Style
- Keep functions small.
- Prefer clear names over cleverness.
- Avoid hardcoding:
  - sheet name / column names
  - bot token
  - webhook URLs  
  Put them in env vars or constants.

---

## 6) What NOT to Do (Hackathon Safety)
- Don’t rename sheet columns or enum values without updating:
  - bot
  - Apps Script
  - `docs/SHEET_SCHEMA.md`
- Don’t add heavy dependencies unless necessary.
- Don’t implement complex admin panels unless the core loop works.

---

## 7) Getting Help
If you’re unsure:
- Ask in team chat before making a big change.
- Prefer shipping a minimal working version first.

---
