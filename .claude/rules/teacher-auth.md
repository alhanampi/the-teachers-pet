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
everything else (architecture, conventions, "Security").

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
  call per request.
- `api/clerk-webhook.ts` receives Clerk's `user.created` webhook (signature verified with
  `svix`, `CLERK_WEBHOOK_SECRET`), then emails a notification via Resend (`RESEND_API_KEY`) to
  `NOTIFY_TEACHER_SIGNUP_EMAIL` (defaults to `alhanampi@gmail.com`) — the endpoint must be
  registered once in the Clerk Dashboard (Webhooks → add endpoint →
  `https://<deployed-domain>/api/clerk-webhook`, subscribed to `user.created`).
- `<SignIn>` (login) and `<UserButton>` (account menu in `AdminLayout` — sign-out, connected
  accounts, password change) are Clerk's own prebuilt components, themed via their `appearance`
  prop — see the root `CLAUDE.md`'s "Stack" section for this scoped exception to the
  no-pre-styled-UI rule.
- All Clerk/Resend env vars (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
  `CLERK_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NOTIFY_TEACHER_SIGNUP_EMAIL`) need to exist both in
  `.env.local` **and** registered on the Vercel project (`vercel env add ...`) for every
  environment that needs them — `vercel dev` only injects into functions the env vars the
  project has declared, not whatever happens to be in `.env.local`.
