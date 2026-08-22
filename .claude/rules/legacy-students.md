---
paths:
  - "src/state/StudentContext.tsx"
  - "src/pages/AdminDashboard/**"
---

# Duplicate students

Loads only when Claude works with `StudentContext.tsx` or `AdminDashboard`. See the root
`CLAUDE.md` for everything else.

There's no login, so a student's identity is just a `studentId` in `localStorage`
(`StudentContext.tsx`). If that gets cleared (browser data wipe, PWA reinstall), the next
`submitName` creates a brand-new `students` row with `crypto.randomUUID()` — the same kid can
end up with two or more rows sharing the same name. Two mitigations, both partial by design (no
login was added, on purpose):

- `submitName` calls `navigator.storage.persist()` (feature-detected, fire-and-forget) when a
  session starts, to reduce (not eliminate) the chance the browser evicts `localStorage` under
  storage pressure. It does nothing for a manual data wipe or reinstall — accepted limitation.
- `AdminDashboard` visually clusters `students` rows that share the same normalized name (trim +
  lowercase) under one group header, purely as a display aid — points and attempt history are
  **never** summed or merged across rows, because two different kids could share a first name
  and silently merging by name alone would be worse than the current bug. Each row still links
  to its own `/admin/dashboard/:studentId` detail page. This is a client-side-only computation
  over the existing `GET /api/students` response — no backend changes.
