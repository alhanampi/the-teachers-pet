# Teacher's Pet

App (PWA, mobile-first) for kids aged 7 to 12 to practice English. The student signs up with a
username, picks their institute and teacher, then switches between three tabs — **Quizzes**
(level → difficulty → exercises, earning a point per exercise), **Vocabulary** (browse
categories of illustrated words) and **My Stats** (a friendly view of their own progress) — see
`.claude/rules/student-tabs.md`.

## Current phase

**Phase 3 in progress: student accounts.** The student now signs up/logs in at `/` via a
**separate Clerk application from the teacher one** (see `.claude/rules/student-auth.md`), picks
their institute and teacher once right after signing up, then goes through level → difficulty →
exercises → summary same as before. A student without parental authorization to create an
account can instead tap "Play without an account" for a fully anonymous, unpersisted guest
session (see `.claude/rules/student-auth.md` → "Guest mode"). There's also a teacher dashboard
behind auth: `/auth` (login), `/admin/dashboard` (students + history, scoped to "my students" —
see `.claude/rules/teacher-auth.md`) and `/admin/exercises` (exercise manager, still global
across all teachers/institutes). The backoffice uses **Clerk** for auth (see
`.claude/rules/teacher-auth.md`) — any teacher can create their own account (Google or
email/password); there's no allowlist, but every signup sends a notification email.

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
  their `appearance` prop rather than styled-components — see `.claude/rules/teacher-auth.md`
  and `.claude/rules/student-auth.md`. Same spirit for data visualization: **Recharts**
  (`src/tabs/Stats`) renders the "My Stats"
  chart — it's SVG primitives we theme ourselves with `src/styles/theme.ts` colors, not a
  pre-styled widget, same category as Radix above.
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
  one per Clerk application — see `.claude/rules/student-auth.md`.
- Student state: React Context + `useReducer` (`src/state/StudentContext.tsx`). Teacher state:
  no custom context at all — `RequireAuth`/`AdminLayout` use Clerk's own `useAuth()`/`useUser()`
  hooks directly (its lifecycle, a Clerk session, doesn't need app state of its own). Don't use
  Redux/Zustand/other global state libs unless the scope grows a lot.
- Persistence: Neon (Postgres) via Vercel serverless functions in `/api/*.ts`. The browser
  **never** connects directly to the database — everything goes through `/api` using
  `@neondatabase/serverless`. Exercises also live in Neon (`exercises` table), not in JSON —
  see `.claude/rules/exercises.md`.
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
api/                  see api/CLAUDE.md (loads only when working here) — schema, /api
                     contract, and the file-by-file map of this directory
public/               see public/CLAUDE.md (loads only when working here) — PWA setup and
                     the file-by-file map of this directory
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
  tabs/                  the three student tabs alongside Quizzes (Onboarding/LevelSelect/../
                        Summary above, unchanged, is the Quizzes tab's own body) — see
                        .claude/rules/student-tabs.md
    Vocabulary/          orchestrator: category picked → word list, else → category grid
    VocabularyCategories/ grid of categories (src/data/vocabulary.ts)
    VocabularyWordList/  grid of word + icon cards for one category
    Stats/               "My Stats" — fetches GET /api/my-attempts, renders the Recharts chart
  components/
    layout/
      Header/          theme dropdown + back/sign-out, visible on every signed-in student screen
      TabBar/            fixed bottom nav (Quizzes/Vocabulary/My Stats) — My Stats hidden for
                        guests
    exercises/          one component per exercise type, each in its own folder
    student/
      StudentClerkProvider/ mounts the student Clerk application, wraps the "/" route
      ConsentInterstitial/   parent/guardian notice shown once, before student sign-up
      PrivacyNotice/         dismissible "no personal data" popup shown on the sign-in screen
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
                          institutes, teachers, onboarding, my-attempts); gets its token via
                          window.Clerk?.session?.getToken()
    adminApi.ts           protected fetch wrappers (students, student-attempts, create exercise);
                          gets its Clerk session token via window.Clerk?.session?.getToken()
    attemptSummary.ts     summarizeByGroup(attempts) — accuracy by level+difficulty, weakest
                          first; shared by AdminStudentDetail ("Where to improve") and Stats
                          ("My Stats"), same data, two different tones
  types/
    exercise.ts
    admin.ts              Student, AttemptRecord
    institute.ts          Institute, Teacher (the picker's shape, not the Neon row)
    vocabulary.ts         VocabularyCategory, VocabularyWord
  data/
    vocabulary.ts         hand-authored categories/words for the Vocabulary tab (not in Neon —
                          see .claude/rules/student-tabs.md; same bootstrap path exercises used
                          pre-Neon)
  styles/
    theme.ts             theme shape (colors, spacing, radii, breakpoints) + types
    themes/               the 5 available color palettes
    GlobalStyle.ts
```

## Data model and `/api` contract

Both live in `api/CLAUDE.md` (loads only when Claude works in `api/`) — the full Neon schema
(`students`, `institutes`, `teachers`, `attempts`, `exercises`) and the endpoint-by-endpoint
contract (method, auth, body shape) for every route under `api/*.ts`.

## Duplicate students (legacy, mostly resolved)

See `.claude/rules/legacy-students.md` (loads only when working in `AdminDashboard` or the
legacy backfill script) — why some pre-account `students` rows can never log in again, and why
`AdminDashboard`'s name-clustering is display-only and never merges data.

## Teacher auth (Clerk)

See `.claude/rules/teacher-auth.md` (loads only when working on `/auth`, `src/components/admin/`,
or `api/_auth.ts`/`api/clerk-webhook.ts`) — Clerk setup, `requireTeacher`, the signup-notification
webhook, and the teacher app's env vars.

## Student auth (Clerk)

See `.claude/rules/student-auth.md` (loads only when working on `StudentAuth`, `StudentFlow`,
`src/components/student/`, or `StudentContext.tsx`) — the separate student Clerk application,
onboarding, guest mode, and the student app's env vars.

## Student tabs

See `.claude/rules/student-tabs.md` (loads only when working in `src/tabs/`, `TabBar`, the
vocabulary data, or `api/my-attempts.ts`) — the three-tab architecture, Vocabulary's
from-scratch mini-flow, and My Stats' Recharts view.

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
- **Students now have real authentication** (see `.claude/rules/student-auth.md`) —
  `POST /api/session`, `GET /api/institutes`, `GET /api/teachers` and
  `POST /api/student-onboarding` all require `requireStudent` and act on the caller's own row,
  never a client-supplied id. `POST /api/attempts` and `GET /api/progress` are the one remaining
  deliberate scope cut: they still trust whatever `studentId` is passed, unauthenticated, same as
  before accounts existed. This is a smaller accepted risk than it used to be (a `studentId`
  alone no longer grants account access, just attempt/point writes for that id) but it's still
  real — don't lower the validations below on the assumption auth already covers it. The teacher
  has real auth too (see `.claude/rules/teacher-auth.md`); `/api/students`,
  `/api/student-attempts` and `POST`/`PUT`/`DELETE /api/exercises` are protected with
  `requireTeacher`, the first two also scoped to the requesting teacher's own students.

## Exercises

See `.claude/rules/exercises.md` (loads only when working in `src/components/exercises/`,
`src/steps/Exercise/`, `ExerciseForm`, or `api/exercises.ts`) — the exercise type union, round
building/shuffling, and teacher authoring flow.

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

See `.claude/rules/header-themes.md` (loads only when working in `Header`, `ThemeContext.tsx`,
or `src/styles/themes/`) — the 5 color palettes and how the active one is picked and persisted.

## PWA

See `public/CLAUDE.md` (loads only when working in `public/`) for the manifest/icon setup.

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
  `.env.local` — see `.claude/rules/teacher-auth.md`/`.claude/rules/student-auth.md`).

## Out of scope for now

Multiple teacher accounts with different roles, manual point editing, exporting reports, showing
the `hint` on the student's screen (the data is already stored, the student-side UI is
missing), exercises scoped per institute/teacher (the exercise bank stays global on purpose), a
student account-settings screen to add an email or change a username without logging out (see
`.claude/rules/student-auth.md`), `requireStudent`-gating `POST /api/attempts`/`GET
/api/progress` (see "Security" above). Also, from `.claude/rules/student-tabs.md`: a
clickable-hotspot image mechanic for Vocabulary (tap a spot on a scene to reveal a word — needs
its own authoring story for hotspot coordinates first) and a teacher-authored Vocabulary admin UI
(content is hand-authored in `src/data/vocabulary.ts` for now, the same bootstrap path exercises
used before Neon).
