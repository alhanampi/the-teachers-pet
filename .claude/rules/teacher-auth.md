---
paths:
  - "src/pages/Auth/**"
  - "src/components/admin/**"
  - "src/lib/adminApi.ts"
  - "api/_auth.ts"
  - "api/clerk-webhook.ts"
---

# Teacher auth (Clerk)

Loads only when Claude works with the teacher-facing auth surface. See the root `CLAUDE.md` for
everything else (architecture, conventions, "Security", "Student auth" in
`.claude/rules/student-auth.md`).

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
  is DB-aware now, not pure token verification. Linking a Clerk account to a `teachers` row isn't
  self-service — there's no in-app flow for it — it's a one-off `INSERT INTO teachers` run by
  hand (see `scripts/link-legacy-students-to-miss-nati.mjs` / `scripts/seed-dev-teacher.mjs` for
  the pattern), which is exactly why the check below exists.
- **A signed-in-but-unlinked Clerk account never reaches the dashboard shell.** `RequireAuth`
  (`src/components/admin/RequireAuth`) calls `GET /api/students?whoami=1` (via
  `useTeacherSession`, `src/lib/useTeacherSession.ts`) before rendering `<Outlet/>` — a 403
  (`teacherId` is null) renders an in-place "not linked" message with a sign-out button instead
  of the dashboard, rather than letting the account through to hit 403s from every other
  endpoint. This renders in place rather than redirecting to `/auth`, since `Auth.tsx`'s own
  `isSignedIn` check would immediately bounce back to `/admin/dashboard`, looping. `whoami=1` is
  folded into `students.ts` rather than its own file to stay under Vercel Hobby's 12-Serverless-
  Functions-per-deployment cap (see `api/CLAUDE.md`).
- `api/clerk-webhook.ts` receives Clerk's `user.created` webhook (signature verified with
  `svix`, `CLERK_WEBHOOK_SECRET`), then emails a notification via Resend (`RESEND_API_KEY`) to
  `NOTIFY_TEACHER_SIGNUP_EMAIL` (defaults to `alhanampi@gmail.com`) — the endpoint must be
  registered once in the Clerk Dashboard (Webhooks → add endpoint →
  `https://<deployed-domain>/api/clerk-webhook`, subscribed to `user.created`).
- `<SignIn>` (login) and `<UserButton>` (account menu in `AdminLayout` — sign-out, connected
  accounts, password change) are Clerk's own prebuilt components, themed via their `appearance`
  prop — see the root `CLAUDE.md`'s "Stack" section for this scoped exception to the
  no-pre-styled-UI rule.
- All Clerk/Resend env vars for the **teacher** app (`VITE_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NOTIFY_TEACHER_SIGNUP_EMAIL`)
  need to exist both in `.env.local` **and** registered on the Vercel project
  (`vercel env add ...`) for every environment that needs them — `vercel dev` only injects into
  functions the env vars the project has declared, not whatever happens to be in `.env.local`.
