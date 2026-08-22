---
paths:
  - "src/components/layout/Header/**"
  - "src/state/ThemeContext.tsx"
  - "src/styles/themes/**"
---

# Header and color themes

Loads only when Claude works with the Header or the theme system. See the root `CLAUDE.md` for
everything else.

There's a fixed `Header` above the whole app (every student screen, including `Welcome`) with a
dropdown for the student to pick between **5 different color palettes** (same layout and
components, only the color set changes). The 5 palettes live as `AppTheme` objects in
`src/styles/themes/`, sharing the same shape `src/styles/theme.ts` defines. The chosen palette
is saved in `localStorage` and applied by wrapping the app in styled-components'
`ThemeProvider` with the active theme (handled from `src/state/ThemeContext.tsx`, separate from
`StudentContext` because it has nothing to do with the student's session).
