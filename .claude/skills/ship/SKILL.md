---
name: ship
description: >-
  Finish and land a change in this repo: verify it, commit it on its own
  branch, then — only after explicit confirmation — merge into main and
  push. Use when the user wants to wrap up, ship, deploy, or merge-and-push
  a change here. Triggers: "ship this", "merge and push", "deploy this",
  "wrap this up", "land this change".
---

# Ship

Lands the current change following this repo's git conventions (see
`CLAUDE.md`). Do the steps below **in order**; each numbered step assumes
the previous one succeeded.

## 1. Branch

If the current branch is `main` and there's uncommitted work for this task,
create a feature branch first (`git checkout -b <short-kebab-name-for-the-
change>`). Never commit work-in-progress directly on `main`. If already on a
feature branch, stay on it.

## 2. Stage only what belongs to this change

Run `git status` first. Stage (`git add`) only the files that are actually
part of the change being shipped — never `git add -A` / `git add .`
blindly. This repo's working tree commonly carries unrelated pre-existing
modifications or untracked scratch files (local settings, debug scripts)
that must **not** get swept into the commit.

## 3. Verify

Run the `verify` skill (format, `tsc --noEmit`, lint). Do not proceed to
commit if any check fails — fix it first.

## 4. Commit

Write a commit message that explains *why*, not just *what* (match the tone
and length of recent commits on this repo — `git log` for examples), ending
with:

```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

Never use `--no-verify` or `-c commit.gpgsign=false`.

## 5. Confirm before merging

Pushing `main` triggers a production deploy (Vercel is wired to this repo's
`main` branch). That's outward-facing and not trivially reversible, so
**always ask for explicit confirmation before merging to `main`** — being
asked to "ship" means "get this ready to land," not unattended license to
touch `main`. Use `AskUserQuestion` with at least these options: merge to
main now / push the branch only (no merge, e.g. for a preview) / stop here
and leave it local.

## 6. Merge + push (only after confirmation)

```
git checkout main
git merge --no-ff <branch> -m "Merge branch '<branch>' into main

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin main
```

Report the resulting commit range (e.g. `abc123..def456`) and mention that
Vercel usually takes a minute or two to finish deploying.
