# `api/`

Backend reference — loads only when Claude works with files in this directory. See the root
`CLAUDE.md` for everything else (architecture, conventions, "Security" — deliberately **not**
duplicated or moved here, since one of its rules is frontend-relevant too and it holds
"never do X" prohibitions that must always be loaded, not just when `api/` is touched).

## Files

```
_db.ts              Neon connection helper (CREATE TABLE/ALTER TABLE IF NOT EXISTS included)
_validate.ts        shared validators (level, difficulty, exercise type, uuid, lengths...)
_auth.ts             requireTeacher(req): verifies the Clerk session token (@clerk/backend)
clerk-webhook.ts     POST — Clerk `user.created` webhook, emails a signup notification (Resend)
session.ts          POST — creates/retrieves a student
attempts.ts          POST — records an attempt (with `correct`), adds a point
progress.ts          GET  — a student's current points
exercises.ts         GET (public) / POST (teacher) — exercise catalog
students.ts          GET (teacher) — list of students
student-attempts.ts GET (teacher) ?studentId= — a student's attempt history
```

## Data model (Neon)

```sql
students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
)

attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  exercise_id text not null,
  level text not null,
  difficulty text not null,
  points integer not null default 1,
  correct boolean not null default true,
  created_at timestamptz not null default now()
)

exercises (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  difficulty text not null,
  type text not null,
  prompt text not null,
  hint text,               -- optional; stored but not shown to the student yet
  options jsonb,           -- multiple-choice
  answer text,             -- multiple-choice, fill-blank, word-order
  pairs jsonb,              -- matching: [{left, right}]
  words jsonb,              -- word-order: authored directly by the teacher (ordered list);
                            -- answer is derived from words.join(" ") server-side
  created_at timestamptz not null default now()
)
```

`students.points` is denormalized for fast reads. `attempts` keeps the full history (including
`correct`, for the teacher's history view). `exercises` replaces the phase-1 JSON files in
`src/data/` — see the root `CLAUDE.md` → "Exercises".

## `/api` contract

- `POST /api/session` — body `{ name: string, studentId?: string }`. If `studentId` exists and
  is valid, reuses that student (updates `name` if it changed); otherwise creates a new one.
  Returns `{ studentId, name, points }`.
- `POST /api/attempts` — body `{ studentId: string, exerciseId: string, level: Level,
difficulty: Difficulty, correct: boolean }`. Inserts the attempt, increments `students.points`
  by 1 (always, whether `correct` or not — the point is for participating). Returns
  `{ points }`.
- `GET /api/progress?studentId=` — returns `{ name, points }`.
- `GET /api/exercises` — public, returns the full `Exercise[]` (student and teacher filter in
  memory, same as before with the static array).
- `POST /api/exercises` — protected (`requireTeacher`). Body: `{ level, difficulty, type,
prompt, hint?, options?, answer?, pairs?, words? }` depending on `type` (word-order sends
  `words`, not `answer` — `answer` is derived server-side as `words.join(" ")`). `id` is
  generated server-side.
- `PUT /api/exercises?id=` — protected (`requireTeacher`). Same body shape as `POST`; validates
  `id` as a UUID and that the exercise exists (404 otherwise). Returns the updated exercise.
- `DELETE /api/exercises?id=` — protected (`requireTeacher`). Validates `id` as a UUID; 404 if it
  doesn't exist. Deletes the row — no cascade concerns, since `attempts.exercise_id` has no FK
  constraint and `student-attempts.ts`'s `LEFT JOIN` already tolerates a missing exercise.
- `GET /api/students` — protected. Returns `{ id, name, points, createdAt }[]`.
- `GET /api/student-attempts?studentId=` — protected. Returns a student's history
  (`AttemptRecord[]`, with `prompt`/`type` resolved via a `LEFT JOIN` to `exercises`).
