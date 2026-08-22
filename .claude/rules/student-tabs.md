---
paths:
  - "src/tabs/**"
  - "src/components/layout/TabBar/**"
  - "src/data/vocabulary.ts"
  - "src/types/vocabulary.ts"
  - "api/my-attempts.ts"
---

# Student tabs

Loads only when Claude works with the tab-bar/Vocabulary/Stats surface. See the root
`CLAUDE.md` for everything else, and `.claude/rules/student-auth.md` for guest mode.

A signed-in student (real account or guest) switches between three tabs via a fixed bottom
`TabBar` (`src/components/layout/TabBar`): **Quizzes**, **Vocabulary**, **My Stats**. `StudentFlow`
holds `activeTab` as local state (not part of `StudentContext` — it's just "which top-level area
is visible", unrelated to the quiz step machine) and mounts `StudentProvider` once, above the tab
switch, so identity (`isGuest`, `points`, etc.) is known regardless of which tab is active.
`Header` also renders once above all three tabs; it takes a `quizTabActive` prop so its
back-button logic (`canGoBack`) only applies while the Quizzes tab is actually visible — otherwise
a stale `step` from a Quizzes session left mid-exercise could show a back arrow that doesn't match
what's on screen.

- **Quizzes** is today's flow, unchanged internally — level → difficulty → exercise → summary,
  still the only tab with points/exercises/Neon writes.
- **Vocabulary** (`src/tabs/Vocabulary`, `VocabularyCategories`, `VocabularyWordList`) is a
  from-scratch mini-flow with its own local state, deliberately **not** built on
  `StudentContext`'s reducer — there's nothing to persist. Content is pre-loaded, hand-authored
  data (`src/data/vocabulary.ts`, `src/types/vocabulary.ts`), not Neon — no teacher-authoring UI
  exists yet (see the root `CLAUDE.md`'s "Out of scope for now"). Browsing awards no points and
  makes zero `/api` calls, so it's fully available in guest mode. Icons are bundled SVGs under
  `public/vocabulary/icons/` rather than native emoji glyphs, specifically to avoid
  device-inconsistent rendering.
- **My Stats** (`src/tabs/Stats`) fetches `GET /api/my-attempts` (`requireStudent`-protected,
  scoped to the caller's own `clerk_user_id` — never a client-supplied `studentId`) and reuses
  `summarizeByGroup` (`src/lib/attemptSummary.ts`) — the same accuracy-by-level/difficulty
  grouping `AdminStudentDetail` computes for the teacher's "Where to improve", just framed warmly
  (encouraging copy instead of a bluntly-flagged weak group) per the "feedback is always
  positive" rule in the root `CLAUDE.md`'s "UI/UX". Rendered with Recharts (see the root
  `CLAUDE.md`'s "Stack"). **This tab doesn't exist for guests** — `TabBar`'s `showStats` prop is
  `!isGuest`, so it's never rendered rather than shown with an empty/locked state, since there's
  genuinely nothing to show without a persisted history.
- Switching tabs mid-exercise just abandons that one in-progress exercise silently, no
  confirmation dialog — any point already earned this round is already synced server-side
  per-attempt, so nothing real is lost.
