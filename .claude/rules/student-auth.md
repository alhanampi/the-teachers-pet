---
paths:
  - "src/pages/StudentAuth/**"
  - "src/pages/StudentFlow/**"
  - "src/components/student/**"
  - "src/state/StudentContext.tsx"
  - "src/lib/studentApi.ts"
  - "api/_auth.ts"
  - "api/session.ts"
  - "api/student-onboarding.ts"
---

# Student auth (Clerk)

Loads only when Claude works with the student-facing auth surface. See the root `CLAUDE.md` for
everything else (architecture, conventions, "Security", "Teacher auth" in
`.claude/rules/teacher-auth.md`, "Student tabs" in `.claude/rules/student-tabs.md`).

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
- `StudentFlow` (`src/pages/StudentFlow`) is the gate: not loaded → "Loading...", signed in →
  mounts `StudentProvider` (only then, so its `POST /api/session` call always has a token), a
  local `guestMode` flag (not signed in, but "Play without an account" was tapped) → mounts
  `StudentProvider guest` (see "Guest mode" below), otherwise → `StudentAuth`
  (`src/pages/StudentAuth`). `StudentAuth` toggles between Clerk's `<SignIn>` and `<SignUp>`
  (`routing="virtual"`, themed via `appearance.variables` exactly like the teacher `<SignIn>`,
  plus `appearance.elements.footer: { display: "none" }` — unlike the teacher `<SignIn>`, this one
  hides Clerk's own footer (its own "Sign up"/"Secured by Clerk"/dev-mode badge), since it's
  redundant with the app's own `SwitchModeButton` below and was pushing "Play without an account"
  below the fold on some screens);
  on the sign-up path, `ConsentInterstitial` (`src/components/student/ConsentInterstitial`) — a
  short note for parents/guardians that only a username and academic history are stored, for the
  teacher's tracking — must be approved before `<SignUp>` renders. Declining returns to sign-in
  without creating an account. The sign-in screen also shows `PrivacyNotice`
  (`src/components/student/PrivacyNotice`), a dismissible popup (built on the shared `Modal`)
  stating this is an internal educational app that collects no personal data beyond study
  statistics — independent from `ConsentInterstitial`, shown to everyone regardless of which
  path (sign in, sign up, guest) they take next. Deliberately in Spanish, not English like the
  rest of the sign-in screen — see the root `CLAUDE.md`'s "Language" section.
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
- **Guest mode**: a deliberate, permanent alternative to Clerk auth for a student without
  parental authorization to create an account — not a temporary stopgap. Entered via "Play
  without an account" on `StudentAuth`'s sign-in screen, which flips a local `guestMode` flag in
  `StudentFlow` (never persisted — a refresh always lands back on the login screen, by design:
  no consent was ever given to remember anything). `StudentProvider` accepts a `guest` prop that
  skips `POST /api/session` entirely and initializes state directly at `"level"` (no onboarding,
  no institute/teacher). Guest play **never touches `/api` beyond the already-public `GET
/api/exercises`** — points still increment locally (so the `PointsPill` works normally) but
  `completeExercise` skips `POST /api/attempts` outright when `isGuest` is true, so nothing about
  a guest's session is ever written to Neon, not even an anonymous row. Tapping the Header logo
  (`signOut`) exits guest mode back to the login screen instead of calling Clerk's `signOut()`.
- All Clerk env vars for the **student** app (`VITE_CLERK_STUDENT_PUBLISHABLE_KEY`,
  `CLERK_STUDENT_SECRET_KEY`) need to exist both in `.env.local` **and** registered on the
  Vercel project, same as the teacher app's vars above.
- **Follow-up, not built yet**: a basic student account-settings screen (Clerk's own
  `<UserButton>`-style prebuilt widget, student-app instance) to add an email or change a
  username without a full logout.
