---
paths:
  - "src/components/exercises/**"
  - "src/steps/Exercise/**"
  - "src/components/admin/ExerciseForm/**"
  - "src/types/exercise.ts"
  - "src/lib/shuffle.ts"
  - "api/exercises.ts"
---

# Exercises

Loads only when Claude works with exercise authoring/playing/typing. See the root `CLAUDE.md`
for everything else, and `api/CLAUDE.md` for the `exercises` table schema and `/api` contract.

Exercises live in Neon's `exercises` table (see `api/CLAUDE.md`), not in JSON — the phase-1 JSON
files (`src/data/exercises/*.json`) were migrated once and deleted. Anything that needs the
full catalog requests `GET /api/exercises` (`fetchExercises` in `src/lib/api.ts` for the
student, the same fetch reused in `AdminExercises`) and filters in memory — the filtering
pattern didn't change, only the data source. Each exercise is typed in `src/types/exercise.ts`
as a discriminated union on `type`: `"multiple-choice" | "fill-blank" | "matching" |
"word-order" | "listening"`, with an optional `hint?: string` field in the database. Each type
has its own component in `src/components/exercises/`, all sharing the
`{ exercise, onComplete(correct: boolean), disabled? }` interface, and all pass `exercise.hint`
straight through to the shared `Prompt` (`src/components/exercises/Prompt`) as its `hint` prop —
`Prompt` is what actually renders the "💡 Need a hint?" `HelpTooltip` when one exists, so none of
the 5 exercise components duplicate that logic. `AdminExercises`' read-only preview list reuses
`Prompt` too, but never passes `hint`, since the teacher already sees/edits it directly in
`ExerciseForm`.

`Exercise.tsx` requests the catalog once when entering the step, builds the round by filtering
on the chosen level/difficulty, shuffles with `shuffleArray` (`src/lib/shuffle.ts`) and keeps
the first `ROUND_SIZE` (5). If fewer than 5 are available for that combination, the round is
shorter — exercises aren't repeated to fill the quota.

**Creating/editing exercises**: only from `/admin/exercises` (`ExerciseForm`, reused for
create/edit/duplicate via a `mode`/`initialValue` prop pair), never by editing the database by
hand except to fix broken data. Teachers can edit or delete an existing exercise, or duplicate
one (opens the form pre-filled, in create-mode — nothing is saved until "Save" is pressed), via
`requireTeacher`-protected `PUT`/`DELETE /api/exercises?id=`. For `word-order`, the teacher
authors the `words` field directly as an ordered list (add/remove, like `matching`'s `pairs`);
`answer` (used for correctness-checking) is derived server-side as `words.join(" ")` — the
client never sends `answer` for `word-order`. `WordOrder.tsx` still reshuffles `exercise.words`
with `shuffleArray` on every render for display, unrelated to authoring order.

If the answer is wrong, `Exercise.tsx` offers "Try again" in addition to "Next": retrying
remounts the exercise component (changing its `key` to `${exercise.id}-${attempt}`) so it
resets to its initial state, instead of giving every component its own reset function. The
point is awarded only once per exercise, on the first attempt (correct or not) — retrying
doesn't award points again.
