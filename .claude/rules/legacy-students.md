---
paths:
  - "src/pages/AdminDashboard/**"
  - "scripts/link-legacy-students-to-miss-nati.mjs"
---

# Duplicate students (legacy, mostly resolved)

Loads only when Claude works with `AdminDashboard` or the legacy backfill script. See the root
`CLAUDE.md` for everything else, and `.claude/rules/student-auth.md` for how real accounts work
now.

Before student accounts existed, a student's identity was just a `studentId` in `localStorage`,
generated client-side — a browser data wipe or PWA reinstall silently created a brand-new
`students` row for the same kid. Real accounts fix this going forward: one Clerk account maps to
exactly one `students` row via `clerk_user_id` (unique), so signing back in on any device
resumes the same row instead of creating a new one.

Two remnants of the old behavior are still relevant:

- Every `students` row created before this migration has `clerk_user_id = null` and was
  one-time-backfilled to a single default teacher/institute (see
  `scripts/link-legacy-students-to-miss-nati.mjs`) — those rows can never be "logged into" again
  (there was no real account behind them), they're read-only history now.
- `AdminDashboard` still visually clusters `students` rows that share the same normalized name
  (trim + lowercase) under one group header, purely as a display aid — points and attempt history
  are **never** summed or merged across rows. This mainly matters for those legacy rows now;
  new, Clerk-backed signups shouldn't produce duplicates in the first place. Each row still links
  to its own `/admin/dashboard/:studentId` detail page. Client-side-only computation over the
  existing `GET /api/students` response — no backend changes.
