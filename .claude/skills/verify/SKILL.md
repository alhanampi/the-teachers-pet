---
name: verify
description: >-
  Run this repo's pre-commit checklist — Prettier format, TypeScript
  typecheck, ESLint, and the Vitest suite — and report the results. Use
  before considering any change in this project done, when the user asks
  to verify/check/validate a change, or as the first step of /ship.
  Triggers: "verify", "check this is ready", "run the checks", "is this
  good to commit".
---

# Verify

Runs the exact checklist from this project's `CLAUDE.md` ("How to run and
verify"), in this order, stopping at the first failing command:

1. `npm run format` — auto-fixes formatting with Prettier. Use `format`, not
   `format:check`: there's no reason to make the user fix formatting by hand
   when Prettier can just do it.
2. `npx tsc --noEmit` — typecheck, no build output.
3. `npm run lint` — ESLint.
4. `npm test` — Vitest, single run (`vitest run`).

## On failure

- **Prettier**: it already rewrote the files; just note which ones changed
  and move on to step 2.
- **`tsc` / `eslint` / `test`**: read the reported errors, fix the actual
  issue, then re-run only the command that failed (not the whole sequence
  from the top) until it passes. Don't silence errors with
  `// eslint-disable` or `as any`, and don't loosen a test's assertions just
  to make it pass — if a lint rule or a test genuinely shouldn't apply here,
  say so and ask before suppressing it, don't suppress it unilaterally.

## On success

Report plainly that all four passed (e.g. "format/tsc/lint/test all
clean"). Don't re-run commands that already passed just to double-check.
