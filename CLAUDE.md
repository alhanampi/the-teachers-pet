# Teacher's Pet

App (PWA, mobile-first) for kids aged 7 to 12 to practice English. The student types their
name, picks a level (A1–C2) and difficulty, and solves exercises, earning a point for each one
completed.

## Current phase

**Phase 2 in progress: teacher dashboard.** The student still goes through their flow at `/`,
with no login. There's also a teacher dashboard behind auth: `/auth` (login),
`/admin/dashboard` (students + history) and `/admin/exercises` (exercise manager). The
backoffice uses **Clerk** for auth (see `.claude/rules/teacher-auth.md`) — any teacher can
create their own account (Google or email/password); there's no allowlist, but every signup
sends a notification email. Student login/signup still doesn't exist, by design: students don't
have accounts.

## Stack

- Vite + React + TypeScript
- styled-components for all styling. No pre-styled third-party component libraries — but
  headless/unstyled a11y primitives are fine when styled entirely with styled-components, e.g.
  `@radix-ui/react-dialog`/`@radix-ui/react-alert-dialog` for `Modal`/`ConfirmDialog` (focus
  trap, Escape-to-close, portal, ARIA roles come from Radix; all visuals come from our own
  `.styles.ts` files). Deliberate, scoped exception: `/auth` and the account menu in
  `AdminLayout` use **Clerk's own prebuilt components** (`<SignIn>`, `<UserButton>`), themed via
  their `appearance` prop rather than styled-components — see `.claude/rules/teacher-auth.md`.
  Nowhere else in the app uses pre-styled UI.
- **PWA, mobile-first.** The app installs as a PWA (manifest + service worker via
  `vite-plugin-pwa`). All design is thought out for phone/tablet first: base styles with no
  media query = mobile, and `min-width` media queries (breakpoints in `src/styles/theme.ts`) get
  added only when adapting to bigger screens is needed. Never the other way around
  (desktop-first with mobile overrides).
- **`react-router-dom` only for the new routes.** The student still does everything at `/`
  without ever changing URL: `StudentFlow` (`src/pages/StudentFlow`) renders based on the
  `step` in `StudentContext`, same as before. The router (`src/App.tsx`) only adds `/auth`,
  `/admin/dashboard(/:studentId)` and `/admin/exercises` — all behind `RequireAuth`
  (`src/components/admin/RequireAuth`). The student never navigates by URL.
- Student state: React Context + `useReducer` (`src/state/StudentContext.tsx`). Teacher state:
  React Context with `useState` (`src/state/TeacherContext.tsx`), kept separate because its
  lifecycle (auth session) has nothing to do with the student's. Don't use Redux/Zustand/other
  global state libs unless the scope grows a lot.
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
  App.tsx             defines the routes (BrowserRouter): "/", "/auth", "/admin/*"
  pages/
    StudentFlow/        what used to live in App.tsx: Header + the student's current step
    Auth/               teacher login
    AdminDashboard/     list of students
    AdminStudentDetail/ a student's history + summary of where to improve
    AdminExercises/     filters + list + creation of exercises
  steps/
    Welcome/
      Welcome.tsx
      Welcome.styles.ts
      index.ts
    LevelSelect/...
    DifficultySelect/...
    Exercise/...
    Summary/...
  components/
    layout/
      Header/          theme dropdown, visible on every student screen
    exercises/          one component per exercise type, each in its own folder
    admin/
      RequireAuth/      route guard: redirects to /auth if there's no teacher session
      AdminLayout/       nav (Students/Exercises) + logout, wraps the /admin/* screens
      ExerciseForm/       create/edit/duplicate an exercise, fields depend on `type`
    ui/                  Button, Card, Select, Input, Modal, FloatingButton, etc.
  state/
    StudentContext.tsx
    ThemeContext.tsx    active color theme + picker, persisted in localStorage
  lib/
    api.ts               public fetch wrappers to /api/* (session, attempts, exercise catalog)
    adminApi.ts           protected fetch wrappers (students, student-attempts, create exercise);
                          gets its Clerk session token via window.Clerk?.session?.getToken()
  types/
    exercise.ts
    admin.ts              Student, AttemptRecord
  styles/
    theme.ts             theme shape (colors, spacing, radii, breakpoints) + types
    themes/               the 5 available color palettes
    GlobalStyle.ts
```

## Data model and `/api` contract

Both live in `api/CLAUDE.md` (loads only when Claude works in `api/`) — the full Neon schema
(`students`, `attempts`, `exercises`) and the endpoint-by-endpoint contract (method, auth, body
shape) for every route under `api/*.ts`.

## Duplicate students

See `.claude/rules/legacy-students.md` (loads only when working in `StudentContext.tsx` or
`AdminDashboard`) — why a `localStorage`-only identity can silently create duplicate `students`
rows, and why `AdminDashboard`'s name-clustering is display-only and never merges data.

## Teacher auth (Clerk)

See `.claude/rules/teacher-auth.md` (loads only when working on `/auth`, `src/components/admin/`,
or `api/_auth.ts`/`api/clerk-webhook.ts`) — Clerk setup, `requireTeacher`, the signup-notification
webhook, and the teacher app's env vars.

## Security

Fixed rules for anything that touches `/api` or student input. These apply across every phase,
not just whichever one is currently in progress.

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
- **The student still has no authentication, by design** (see "Current phase"): anyone with a
  `studentId` can read/write that student's progress via `/api`. It's an accepted risk because
  students don't have accounts — don't add student login, but also don't lower the validations
  above: they're the only current barrier against abuse and garbage-data injection into Neon.
  The teacher does have real auth (see `.claude/rules/teacher-auth.md`); `/api/students`,
  `/api/student-attempts` and `POST /api/exercises` are protected with `requireTeacher`.

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
with input: `Welcome`, `FillBlank`). To achieve that:

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
`--fix`. `eslint-config-prettier` turns off the ESLint rules that could clash with Prettier. See
"How to run and verify" for the exact commands.

## How to run and verify

- `npm run dev` for frontend only; `vercel dev` to also test `/api` against Neon (needed to
  test `/auth` and `/admin/*`, which depend on `/api`).
- `npm run format:check` (or `npm run format` to auto-fix), `npx tsc --noEmit` and `npm run lint`
  before considering a change done.
- Manual student verification: go through name → level → difficulty → exercises (all 4 types)
  → summary, and confirm in Neon that rows show up in `students`/`attempts` (with `correct` set
  correctly) and that `points` updates.
- Manual teacher verification: log in at `/auth`, confirm that without a session `/admin/*`
  redirects to `/auth`; in `/admin/exercises` change all 3 filters and see the counter react,
  create one exercise of each type (with a hint) and confirm it shows up in the list and in the
  student's round if level/difficulty match; in `/admin/dashboard` open a student and confirm
  the history and the "where to improve" summary match the attempts made.
- Requires `DATABASE_URL` in `.env.local` (Neon connection string, not committed), plus
  `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `RESEND_API_KEY` (all
  also registered on the Vercel project, not just in `.env.local` — see
  `.claude/rules/teacher-auth.md`).

## Out of scope for now

Multiple teacher accounts with different roles, manual point editing, exporting reports, showing
the `hint` on the student's screen (the data is already stored, the student-side UI is
missing).
