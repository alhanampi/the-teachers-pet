# `api/`

Backend reference — loads only when Claude works with files in this directory. See the root
`CLAUDE.md` for everything else (architecture, conventions, "Security" — deliberately **not**
duplicated or moved here, since one of its rules is frontend-relevant too and it holds
"never do X" prohibitions that must always be loaded, not just when `api/` is touched).

## Files

```
_db.ts              Neon connection helper (CREATE TABLE/ALTER TABLE IF NOT EXISTS included)
_validate.ts        shared validators (level, difficulty, exercise type, uuid, lengths...)
_auth.ts             requireTeacher(req)/requireStudent(req): verify a Clerk session token
                     (@clerk/backend) — one function per Clerk application
clerk-webhook.ts     POST — Clerk `user.created` webhook (teacher app), emails a signup
                     notification (Resend)
session.ts          POST (student) — creates/retrieves the signed-in student's row
institutes.ts        GET (student) — list of institutes
teachers.ts          GET (student) ?instituteId= — a institute's teachers
student-onboarding.ts POST (student) — sets the signed-in student's teacher_id
attempts.ts          POST — records an attempt (with `correct`), adds a point
progress.ts          GET  — a student's current points
my-attempts.ts       GET (student) — the signed-in student's own attempt history, for "My
                     Stats" (never a guest — that tab doesn't exist in guest mode)
exercises.ts         GET (public) / POST (teacher) — exercise catalog, global (not
                     scoped per institute/teacher)
students.ts          GET (teacher) — list of the requesting teacher's own students; GET
                     ?whoami=1 (teacher) — resolves the caller's own linkage status instead
                     (403 if the signed-in Clerk account has no `teachers` row yet), used by
                     `RequireAuth` to keep an unlinked account off the dashboard shell — folded
                     in here rather than its own file to stay under Vercel Hobby's 12-Serverless-
                     Functions-per-deployment cap
student-attempts.ts GET (teacher) ?studentId= — a student's attempt history (must belong to
                     the requesting teacher)
```

## Data model (Neon)

```sql
students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null default 0,
  clerk_user_id text unique,        -- null for legacy pre-accounts rows, set on first login
  teacher_id uuid references teachers(id), -- null until onboarding is completed
  created_at timestamptz not null default now()
)

institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
)

teachers (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  display_name text not null,
  institute_id uuid not null references institutes(id),
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
`src/data/` — see the root `CLAUDE.md` → "Exercises". A teacher belongs to exactly one
institute — `students` stores only `teacher_id`, not `institute_id`; a student's institute is
always derived via `teacher_id → teachers.institute_id`.

## `/api` contract

- `POST /api/session` — protected (`requireStudent`), no meaningful body. Identity comes from the
  verified token: upserts a `students` row keyed by `clerk_user_id` (name = Clerk username,
  clamped to `MAX_NAME_LENGTH`). Returns `{ studentId, name, points, teacherId }` (`teacherId` is
  `null` until onboarding is completed).
- `GET /api/institutes` — protected (`requireStudent`). Returns `{ id, name }[]`.
- `GET /api/teachers?instituteId=` — protected (`requireStudent`). `instituteId` validated as a
  UUID. Returns `{ id, displayName }[]` for that institute.
- `POST /api/student-onboarding` — protected (`requireStudent`). Body `{ teacherId: string }`
  (validated as a UUID). Sets `teacher_id` on the caller's own `students` row (found via
  `clerk_user_id`, never a client-supplied id). Returns `{ teacherId }`.
- `POST /api/attempts` — body `{ studentId: string, exerciseId: string, level: Level,
difficulty: Difficulty, correct: boolean }`. Inserts the attempt, increments `students.points`
  by 1 (always, whether `correct` or not — the point is for participating). Returns
  `{ points }`. Not `requireStudent`-protected yet — see the root `CLAUDE.md` → "Security".
- `GET /api/progress?studentId=` — returns `{ name, points }`. Same as above, not yet gated by
  `requireStudent`.
- `GET /api/exercises` — public, returns the full `Exercise[]` (student and teacher filter in
  memory, same as before with the static array). Global — not scoped by institute or teacher.
- `POST /api/exercises` — protected (`requireTeacher`). Body: `{ level, difficulty, type,
prompt, hint?, options?, answer?, pairs?, words? }` depending on `type` (word-order sends
  `words`, not `answer` — `answer` is derived server-side as `words.join(" ")`). `id` is
  generated server-side.
- `PUT /api/exercises?id=` — protected (`requireTeacher`). Same body shape as `POST`; validates
  `id` as a UUID and that the exercise exists (404 otherwise). Returns the updated exercise.
- `DELETE /api/exercises?id=` — protected (`requireTeacher`). Validates `id` as a UUID; 404 if it
  doesn't exist. Deletes the row — no cascade concerns, since `attempts.exercise_id` has no FK
  constraint and `student-attempts.ts`'s `LEFT JOIN` already tolerates a missing exercise.
- `GET /api/students` — protected (`requireTeacher`), scoped to `teacher.teacherId` (403 if the
  calling Clerk account has no `teachers` row). Returns `{ id, name, points, createdAt }[]` — only
  the requesting teacher's own students.
- `GET /api/students?whoami=1` — same auth/403 as above, but returns `{ teacherId, email }`
  instead of the student list, skipping the query entirely. `RequireAuth` calls this before
  rendering `/admin/*`, so a Clerk-authenticated-but-unlinked account gets a clear in-app message
  instead of reaching the dashboard shell and hitting 403s from every other endpoint.
- `GET /api/student-attempts?studentId=` — protected (`requireTeacher`), same scoping: 404s if
  `studentId` doesn't belong to the requesting teacher. Returns a student's history
  (`AttemptRecord[]`, with `prompt`/`type` resolved via a `LEFT JOIN` to `exercises`).
- `GET /api/my-attempts` — protected (`requireStudent`). No query param — resolves the caller's
  own `students.id` via `clerk_user_id`, same shape as `student-attempts` (`AttemptRecord[]`).
  Backs the "My Stats" tab.
