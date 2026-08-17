# Teacher's Pet

App (PWA, mobile-first) for kids aged 7 to 12 to practice English. The student signs up with a
username, picks their institute and teacher, then picks a level (A1–C2) and difficulty, and
solves exercises, earning a point for each one completed.

## Current phase

**Phase 3 in progress: student accounts.** The student now signs up/logs in at `/` via a
**separate Clerk application from the teacher one** (see "Student auth"), picks their institute
and teacher once right after signing up, then goes through level → difficulty → exercises →
summary same as before. There's also a teacher dashboard behind auth: `/auth` (login),
`/admin/dashboard` (students + history, scoped to "my students" — see "Teacher auth") and
`/admin/exercises` (exercise manager, still global across all teachers/institutes). The
backoffice uses **Clerk** for auth (see "Teacher auth") — any teacher can create their own
account (Google or email/password); there's no allowlist, but every signup sends a notification
email.

## Stack

- Vite + React + TypeScript
- styled-components for all styling. No pre-styled third-party component libraries — but
  headless/unstyled a11y primitives are fine when styled entirely with styled-components, e.g.
  `@radix-ui/react-dialog`/`@radix-ui/react-alert-dialog` for `Modal`/`ConfirmDialog` (focus
  trap, Escape-to-close, portal, ARIA roles come from Radix; all visuals come from our own
  `.styles.ts` files), and `@radix-ui/react-popover` for `HelpTooltip`. Deliberate, scoped
  exception: `/auth` and the account menu in `AdminLayout` use **Clerk's own prebuilt
  components** (`<SignIn>`, `<UserButton>`) for the teacher, and `StudentAuth`
  (`src/pages/StudentAuth`) uses Clerk's `<SignIn>`/`<SignUp>` for the student — all themed via
  their `appearance` prop rather than styled-components — see "Teacher auth" and "Student auth".
  Nowhere else in the app uses pre-styled UI.
- **PWA, mobile-first.** The app installs as a PWA (manifest + service worker via
  `vite-plugin-pwa`). All design is thought out for phone/tablet first: base styles with no
  media query = mobile, and `min-width` media queries (breakpoints in `src/styles/theme.ts`) get
  added only when adapting to bigger screens is needed. Never the other way around
  (desktop-first with mobile overrides).
- **`react-router-dom` only for the new routes.** The student still does everything at `/`
  without ever changing URL: `StudentFlow` (`src/pages/StudentFlow`) shows `StudentAuth` when
  signed out, or renders based on the `step` in `StudentContext` when signed in. The router
  (`src/App.tsx`) only adds `/auth`, `/admin/dashboard(/:studentId)` and `/admin/exercises` — all
  behind `RequireAuth` (`src/components/admin/RequireAuth`). The student never navigates by URL,
  even to sign in/up. `App.tsx` also splits the tree into two mutually-exclusive layout routes,
  one per Clerk application — see "Student auth".
- Student state: React Context + `useReducer` (`src/state/StudentContext.tsx`). Teacher state:
  no custom context at all — `RequireAuth`/`AdminLayout` use Clerk's own `useAuth()`/`useUser()`
  hooks directly (its lifecycle, a Clerk session, doesn't need app state of its own). Don't use
  Redux/Zustand/other global state libs unless the scope grows a lot.
- Persistence: Neon (Postgres) via Vercel serverless functions in `/api/*.ts`. The browser
  **never** connects directly to the database — everything goes through `/api` using
  `@neondatabase/serverless`. Exercises also live in Neon (`exercises` table), not in JSON —
  see "Exercises".
- `vercel dev` (devDependency) to run frontend + `/api` together locally.

## Code conventions

- Functional components with hooks. One component per file.
- Component files: `PascalCase.tsx`. Utilities/helpers: `camelCase.ts`.
- Props typed with `interface`. Strict TypeScript, no `any`.
- No comments except to explain a non-obvious why (hidden constraint, workaround). Never
  comments that describe what the code does.
- **Each component lives in its own folder, with its styles in a separate file:**
  `ComponentName/ComponentName.tsx` + `ComponentName/ComponentName.styles.ts` (+
  `ComponentName/index.ts` re-exporting, so it can be imported as
  `from ".../ComponentName"`). `styled(...)` calls always go in the `.styles.ts` file; the
  `.tsx` imports them and only holds JSX + logic. Never a `styled(...)` defined inline in the
  same file as the component.
- Styles always with styled-components, using the centralized theme in `src/styles/theme.ts`
  (colors, spacing, radii, typography, breakpoints) + `ThemeProvider`. Don't hardcode
  colors/spacing outside the theme.
- Don't add abstractions, flags, or error handling for cases that can't happen within this
  scope. Don't design for hypothetical future requirements.

## Folder structure

```
api/
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
  exercises.ts         GET (public) / POST (teacher) — exercise catalog, global (not
                       scoped per institute/teacher)
  students.ts          GET (teacher) — list of the requesting teacher's own students
  student-attempts.ts GET (teacher) ?studentId= — a student's attempt history (must belong to
                       the requesting teacher)
public/
  manifest.webmanifest (or generated by vite-plugin-pwa), PWA icons
src/
  main.tsx
  App.tsx             defines the routes (BrowserRouter): "/", "/auth", "/admin/*" — "/" and
                      "/auth"+"/admin/*" each sit under their own Clerk application's provider
  pages/
    StudentFlow/        Header + StudentAuth (signed out) or the student's current step
    StudentAuth/        student sign-in/sign-up (Clerk), consent gate before sign-up
    Auth/               teacher login
    AdminDashboard/     list of students
    AdminStudentDetail/ a student's history + summary of where to improve
    AdminExercises/     filters + list + creation of exercises
  steps/
    Onboarding/          choose institute, then teacher — the floor of student back-navigation
    LevelSelect/...
    DifficultySelect/...
    Exercise/...
    Summary/...
  components/
    layout/
      Header/          theme dropdown + back/sign-out, visible on every signed-in student screen
    exercises/          one component per exercise type, each in its own folder
    student/
      StudentClerkProvider/ mounts the student Clerk application, wraps the "/" route
      ConsentInterstitial/   parent/guardian notice shown once, before student sign-up
    admin/
      RequireAuth/      route guard: redirects to /auth if there's no teacher session
      TeacherClerkProvider/ mounts the teacher Clerk application, wraps /auth + /admin/* routes
      AdminLayout/       nav (Students/Exercises) + logout, wraps the /admin/* screens
      ExerciseForm/       create/edit/duplicate an exercise, fields depend on `type`
    ui/                  Button, Card, Select, Input, Modal, FloatingButton, HelpTooltip, etc.
  state/
    StudentContext.tsx  signed-in student's step/level/difficulty/points — identity comes from
                        Clerk, not localStorage
    ThemeContext.tsx    active color theme + picker, persisted in localStorage
  lib/
    api.ts               public fetch wrappers to /api/* (attempts, exercise catalog)
    studentApi.ts         protected fetch wrappers for the student Clerk app (session,
                          institutes, teachers, onboarding); gets its token via
                          window.Clerk?.session?.getToken()
    adminApi.ts           protected fetch wrappers (students, student-attempts, create exercise);
                          gets its Clerk session token via window.Clerk?.session?.getToken()
  types/
    exercise.ts
    admin.ts              Student, AttemptRecord
    institute.ts          Institute, Teacher (the picker's shape, not the Neon row)
  styles/
    theme.ts             theme shape (colors, spacing, radii, breakpoints) + types
    themes/               the 5 available color palettes
    GlobalStyle.ts
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
`src/data/` — see "Exercises". A teacher belongs to exactly one institute — `students` stores
only `teacher_id`, not `institute_id`; a student's institute is always derived via
`teacher_id → teachers.institute_id`.

## Duplicate students (legacy, mostly resolved)

Before student accounts existed, a student's identity was just a `studentId` in `localStorage`,
generated client-side — a browser data wipe or PWA reinstall silently created a brand-new
`students` row for the same kid. Real accounts (see "Student auth") fix this going forward: one
Clerk account maps to exactly one `students` row via `clerk_user_id` (unique), so signing back in
on any device resumes the same row instead of creating a new one.

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

## Teacher auth (Clerk)

- The backoffice uses **Clerk**, not Neon Auth. Sign-up is **open** — any teacher can create
  their own account (Google or email/password) via Clerk's own `<SignIn>` widget at `/auth`
  (`src/pages/Auth/Auth.tsx`) — there's no allowlist gating access. Every new signup triggers a
  notification email (see below), which is the only "who signed up" visibility, by design.
- Client: `src/main.tsx` wraps the app in `<ClerkProvider publishableKey={...}>`
  (`VITE_CLERK_PUBLISHABLE_KEY`). There's no custom teacher-auth context —
  `RequireAuth.tsx`/`AdminLayout.tsx` use Clerk's own `useAuth()`/`useUser()` hooks directly.
  `src/lib/adminApi.ts`'s `authorizedFetch` gets a fresh session token via
  `window.Clerk?.session?.getToken()` (Clerk's documented pattern for non-component code) on
  every protected request.
- Server: `api/_auth.ts` exports `requireTeacher(req)`, which validates the
  `Authorization: Bearer` header via `@clerk/backend`'s `verifyToken` (`CLERK_SECRET_KEY`) — no
  allowlist check. The email claim requires a custom Clerk session-token claim configured once
  in the Clerk Dashboard (Sessions → Customize session token:
  `{"email": "{{user.primary_email_address}}"}`), so it's available without an extra Clerk API
  call per request. `requireTeacher` also resolves the caller's own `teachers.id` row (`teacher.
teacherId`, `null` if this Clerk account has no `teachers` row yet) — this is what
  `students.ts`/`student-attempts.ts` use to scope a teacher to their own students, so `_auth.ts`
  is DB-aware now, not pure token verification.
- `api/clerk-webhook.ts` receives Clerk's `user.created` webhook (signature verified with
  `svix`, `CLERK_WEBHOOK_SECRET`), then emails a notification via Resend (`RESEND_API_KEY`) to
  `NOTIFY_TEACHER_SIGNUP_EMAIL` (defaults to `alhanampi@gmail.com`) — the endpoint must be
  registered once in the Clerk Dashboard (Webhooks → add endpoint →
  `https://<deployed-domain>/api/clerk-webhook`, subscribed to `user.created`).
- `<SignIn>` (login) and `<UserButton>` (account menu in `AdminLayout` — sign-out, connected
  accounts, password change) are Clerk's own prebuilt components, themed via their `appearance`
  prop — see the "Stack" section's note on this scoped exception to the no-pre-styled-UI rule.
- All Clerk/Resend env vars for the **teacher** app (`VITE_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NOTIFY_TEACHER_SIGNUP_EMAIL`)
  need to exist both in `.env.local` **and** registered on the Vercel project
  (`vercel env add ...`) for every environment that needs them — `vercel dev` only injects into
  functions the env vars the project has declared, not whatever happens to be in `.env.local`.

## Student auth (Clerk)

- Students authenticate through a **second, separate Clerk Application** from the teacher one —
  necessary because Clerk's identifier rules (username vs. email, required vs. optional) are set
  per-application, and the teacher app must keep requiring email/Google untouched. On this
  application: **username** is the primary identifier, **email is optional** (a student can add
  one later from their own Clerk account, but it's never required to sign up or play), password
  strategy, no social sign-in.
- Client: `StudentClerkProvider` (`src/components/student/StudentClerkProvider`) wraps only the
  `/` route with `<ClerkProvider publishableKey={VITE_CLERK_STUDENT_PUBLISHABLE_KEY} signInUrl="/"
signUpUrl="/">` — `TeacherClerkProvider` does the same for `/auth`+`/admin/*` with the teacher
  key. Both live as layout routes in `src/App.tsx`; since `/` and `/auth`+`/admin/*` are
  mutually exclusive in the router, only one `ClerkProvider` (and one `window.Clerk`) is ever
  mounted at a time.
- `StudentFlow` (`src/pages/StudentFlow`) is the gate: not loaded → "Loading...", not signed in →
  `StudentAuth` (`src/pages/StudentAuth`), signed in → mounts `StudentProvider` (only then, so its
  `POST /api/session` call always has a token). `StudentAuth` toggles between Clerk's `<SignIn>`
  and `<SignUp>` (`routing="virtual"`, themed via `appearance.variables` exactly like the teacher
  `<SignIn>`); on the sign-up path, `ConsentInterstitial`
  (`src/components/student/ConsentInterstitial`) — a short note for parents/guardians that only a
  username and academic history are stored, for the teacher's tracking — must be approved before
  `<SignUp>` renders. Declining returns to sign-in without creating an account.
- Server: `api/_auth.ts` exports `requireStudent(req)`, structurally identical to
  `requireTeacher` but verified against `CLERK_STUDENT_SECRET_KEY` and reading a `username`
  session-token claim (`{"username": "{{user.username}}"}`, configured once in the student Clerk
  Dashboard, mirroring the teacher app's `email` claim). Verifying a token against the wrong
  app's secret key fails outright, so the two auth domains are cryptographically isolated for
  free — no extra cross-app check needed.
- **Onboarding** (choosing institute, then teacher) is a step in `StudentContext`'s reducer
  (`"onboarding"`, before `"level"`) rather than a separate gate — `Onboarding.tsx`
  (`src/steps/Onboarding`) is one screen, two stacked `<Select>`s (teacher list filtered by the
  chosen institute via `GET /api/teachers?instituteId=`), submitted via `POST
/api/student-onboarding`. A student lands back on `"onboarding"` (not `"level"`) on every login
  until they've completed it once — after that, `teacher_id` being set on their `students` row is
  what lets them skip straight to `"level"`.
- **Identity has no localStorage component at all anymore** — `StudentContext`'s only source of
  truth is the Clerk session (`useUser`/`useAuth`/`useClerk`) plus whatever `POST /api/session`
  (student-authenticated) returns on mount. There is no student-generated `studentId`; the server
  decides it (`gen_random_uuid()` on first insert, keyed by `clerk_user_id` after that).
- **The only way to "change your name" is to log out** (`Header`'s logo — the same
  progress-loss `ConfirmDialog` as before now triggers a real Clerk `signOut()` instead of
  clearing `localStorage`) and sign into a different account; there's no in-app rename yet.
  In-app back-navigation (`Header`'s `←`) never reaches earlier than `"level"` — `"onboarding"`
  has no back button, matching the fact that the student/teacher relationship is set once,
  not something to idly step back through.
- All Clerk env vars for the **student** app (`VITE_CLERK_STUDENT_PUBLISHABLE_KEY`,
  `CLERK_STUDENT_SECRET_KEY`) need to exist both in `.env.local` **and** registered on the
  Vercel project, same as the teacher app's vars above.
- **Follow-up, not built yet**: a basic student account-settings screen (Clerk's own
  `<UserButton>`-style prebuilt widget, student-app instance) to add an email or change a
  username without a full logout.

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
  `{ points }`. Not `requireStudent`-protected yet — see "Security".
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
- `GET /api/student-attempts?studentId=` — protected (`requireTeacher`), same scoping: 404s if
  `studentId` doesn't belong to the requesting teacher. Returns a student's history
  (`AttemptRecord[]`, with `prompt`/`type` resolved via a `LEFT JOIN` to `exercises`).

## Security

Fixed rules for anything that touches `/api` or student input. These aren't just for this
phase: they hold once the teacher backoffice is added in phase 2.

- **SQL only parameterized.** With `@neondatabase/serverless`, queries are always written as a
  tagged template: `` sql`SELECT ... WHERE id = ${value}` ``. Never build SQL with string
  concatenation/interpolation, and never use `sql.unsafe(...)` or pass table/column identifiers
  that come from a request. If a dynamic identifier is ever needed, it's validated against a
  fixed whitelist in code first — never built from the raw client value.
- **Every `req.body`/`req.query` is hostile, no matter what exists in the frontend.** The
  client's TypeScript types (`Level`, `Difficulty`, etc.) don't protect the endpoint: anyone can
  hit `/api/*` directly with curl. Each handler explicitly validates what it receives before
  touching the database — that lives in `api/_validate.ts` (`isValidUuid`, `isValidLevel`,
  `isValidDifficulty`, length limits), and every handler (`session.ts`, `attempts.ts`,
  `progress.ts`) uses it before any query. If a new field with a closed domain gets added, it
  gets validated there, not just via the TS type.
- **Bounded lengths on the server too.** An `<input>`'s `maxLength` is UX, not security — it can
  be skipped by hitting the API directly. Any string that gets stored in Neon (`name`,
  `exerciseId`) has an explicit server-side limit (`MAX_NAME_LENGTH`, `MAX_EXERCISE_ID_LENGTH`
  in `api/_validate.ts`).
- **`studentId` is treated as a credential, not public data.** It's generated with
  `crypto.randomUUID()` (not incremental, not guessable), and every endpoint that receives it
  validates it has UUID shape before using it in a query. Don't log `studentId` in plain text
  outside what's strictly necessary for debugging.
- **`/api` handlers never return the raw Postgres error to the client.** Every handler wraps its
  logic in `try/catch`: logs the full error server-side with `console.error` and responds with a
  generic message (`res.status(500).json({ error: "..." })`). A Postgres message
  (`invalid input syntax for type uuid: "..."`, column names, etc.) is internal information that
  shouldn't reach the browser.
- **XSS: trust React's escaping, don't reinvent sanitization.** JSX automatically escapes
  everything rendered as text (student name, `exercises` content, etc.). So: never use
  `dangerouslySetInnerHTML` with data coming from the student, the teacher, or the database, and
  never build HTML by hand with template strings to insert into the DOM.
- **Secrets stay out of the repo.** `DATABASE_URL` lives only in `.env.local` (local) or in the
  Vercel project's environment variables (deploy) — never hardcoded in code or committed.
  `.gitignore` explicitly ignores `.env` and `.env.*` (not just `*.local`), so an `.env` with the
  real connection string can never end up committed by mistake.
- **Students now have real authentication** (see "Student auth") — `POST /api/session`,
  `GET /api/institutes`, `GET /api/teachers` and `POST /api/student-onboarding` all require
  `requireStudent` and act on the caller's own row, never a client-supplied id.
  `POST /api/attempts` and `GET /api/progress` are the one remaining deliberate scope cut: they
  still trust whatever `studentId` is passed, unauthenticated, same as before accounts existed.
  This is a smaller accepted risk than it used to be (a `studentId` alone no longer grants
  account access, just attempt/point writes for that id) but it's still real — don't lower the
  validations below on the assumption auth already covers it. The teacher has real auth too (see
  "Teacher auth"); `/api/students`, `/api/student-attempts` and `POST`/`PUT`/`DELETE
/api/exercises` are protected with `requireTeacher`, the first two also scoped to the
  requesting teacher's own students.

## Exercises

Exercises live in Neon's `exercises` table (see "Data model"), not in JSON — the phase-1 JSON
files (`src/data/exercises/*.json`) were migrated once and deleted. Anything that needs the
full catalog requests `GET /api/exercises` (`fetchExercises` in `src/lib/api.ts` for the
student, the same fetch reused in `AdminExercises`) and filters in memory — the filtering
pattern didn't change, only the data source. Each exercise is typed in `src/types/exercise.ts`
as a discriminated union on `type`: `"multiple-choice" | "fill-blank" | "matching" |
"word-order"`, with an optional `hint?: string` field in the database (not shown on the
student's screen yet). Each type has its own component in `src/components/exercises/`, all
sharing the `{ exercise, onComplete(correct: boolean), disabled? }` interface.

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

## UI/UX

Designed for kids aged 7 to 12, **mobile-first** (phone and tablet as the primary screens,
desktop is secondary): rounded typography (a Google Font like "Baloo 2" or "Fredoka"), large
sizes, a bright, high-contrast palette, big buttons with rounded corners and a good touch
target (at least ~44px tall). Feedback is always positive/encouraging, never punitive. Short
text, backed by icons/emojis. Single-column layouts by default; grids with more than one
column only from tablet breakpoints up.

**No screen should ever require scrolling**, not even with the phone's keyboard open (screens
with input: `StudentAuth`, `Onboarding`, `FillBlank`). To achieve that:

- `useViewportHeightSync` (`src/lib/useViewportHeightSync.ts`), mounted once in `App.tsx`,
  listens to `window.visualViewport` and stores the real visible height in the `--app-height`
  CSS variable, which `GlobalStyle` uses for `<html>` (with `100dvh` as a fallback). That way the
  layout actually shrinks when the keyboard appears, instead of keeping its previous height.
- The viewport meta tag in `index.html` includes `interactive-widget=resizes-content` (helps
  Chrome/Android shrink the viewport instead of covering content with the keyboard).
- `body`/`#root` have `overflow: hidden` — the page never scrolls as a whole.
- `Screen` (`src/components/ui/Screen/Screen.styles.ts`) has its own `overflow-y: auto` as a
  local safety net (e.g. with very large accessibility fonts), but the goal is that it's never
  needed: that's why `Screen`'s gap/padding is compact on mobile.
- Before adding content to a screen, think about the worst case: a small phone (iPhone SE) with
  the keyboard open (~250px of visible height minus the header). If it doesn't fit, shrink
  spacing/sizes before adding scroll.

## Language

**All text the student sees is in English**: titles, subtitles, buttons, placeholders,
aria-labels, color theme names, `<title>` and `index.html` (`lang="en"`), and the PWA manifest.
The only exception is the exercise data itself when an exercise intentionally requires mixing
languages (for example, in vocabulary `matching` where the right-hand pair is the Spanish
translation of the English word) — that isn't translated, because translating it would break
the exercise. Code comments stay in Spanish, because they're for whoever develops, not for the
student.

## Header and color themes

There's a fixed `Header` above every signed-in student screen (not `StudentAuth`) with a
dropdown for the student to pick between **5 different color palettes** (same layout and
components, only the color set changes). The 5 palettes live as `AppTheme` objects in
`src/styles/themes/`, sharing the same shape `src/styles/theme.ts` defines. The chosen palette
is saved in `localStorage` and applied by wrapping the app in styled-components'
`ThemeProvider` with the active theme (handled from `src/state/ThemeContext.tsx`, separate from
`StudentContext` because it has nothing to do with the student's session).

## PWA

`vite-plugin-pwa` generates the manifest and service worker. Display name: **Teacher's Pet**.
Placeholder icon: a little apple (no final logo yet) — lives as an SVG in `public/icons/` and
is referenced in the manifest and favicon. Once there's a real logo, only those files need to
be replaced, not the config. Mobile-first applies to both the CSS and the layout of touch
elements (Header, exercise buttons, etc).

## Formatting

Formatting is handled by **Prettier** (`.prettierrc.json`), not manual judgment or ESLint's
`--fix`. `eslint-config-prettier` turns off the ESLint rules that could clash with Prettier.
Before considering a change done: `npm run format` (or `npm run format:check` to just check,
useful in CI).

## How to run and verify

- `npm run dev` for frontend only; `vercel dev` to also test `/api` against Neon (needed to
  test `/`, `/auth` and `/admin/*`, all of which depend on `/api`). `/verify` (project skill)
  runs the three checks below in order.
- `npm run format:check`, `npx tsc --noEmit` and `npm run lint` before considering a change
  done.
- Manual student verification: sign up (new username/password) at `/`, approve the consent
  interstitial, pick an institute/teacher, then go through level → difficulty → exercises (all 4
  types) → summary, confirming in Neon that a `students` row exists with `clerk_user_id` and
  `teacher_id` set and that `attempts` rows show up (with `correct` set correctly) and `points`
  updates. Sign out and back in — should skip straight to `"level"`, no onboarding replay.
- Manual teacher verification: log in at `/auth`, confirm that without a session `/admin/*`
  redirects to `/auth`; in `/admin/exercises` change all 3 filters and see the counter react,
  create one exercise of each type (with a hint) and confirm it shows up in the list and in the
  student's round if level/difficulty match; in `/admin/dashboard`, confirm only students who
  picked this teacher are listed, open one and confirm the history and the "where to improve"
  summary match the attempts made.
- Requires `DATABASE_URL` in `.env.local` (Neon connection string, not committed), plus the
  teacher Clerk app's `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`,
  `RESEND_API_KEY` and the student Clerk app's `VITE_CLERK_STUDENT_PUBLISHABLE_KEY`,
  `CLERK_STUDENT_SECRET_KEY` (all also registered on the Vercel project, not just in
  `.env.local` — see "Teacher auth"/"Student auth").

## Out of scope for now

Multiple teacher accounts with different roles, manual point editing, exporting reports, showing
the `hint` on the student's screen (the data is already stored, the student-side UI is
missing), exercises scoped per institute/teacher (the exercise bank stays global on purpose), a
student account-settings screen to add an email or change a username without logging out (see
"Student auth"), `requireStudent`-gating `POST /api/attempts`/`GET /api/progress` (see
"Security").
