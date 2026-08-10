export const breakpoints = {
  tablet: "600px",
  desktop: "1024px",
} as const;

export const media = {
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
} as const;

export const baseTheme = {
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  radii: {
    sm: "12px",
    md: "20px",
    lg: "28px",
    pill: "999px",
  },
  fontSizes: {
    sm: "1rem",
    md: "1.25rem",
    lg: "1.75rem",
    xl: "2.5rem",
    xxl: "3.5rem",
  },
  fonts: {
    body: "'Baloo 2', 'Comic Sans MS', sans-serif",
  },
  shadows: {
    card: "0 6px 0 rgba(0, 0, 0, 0.1)",
    button: "0 5px 0",
  },
  layout: {
    headerHeight: "60px",
  },
  breakpoints,
} as const;

export interface ColorPalette {
  background: string;
  surface: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  success: string;
  successDark: string;
  error: string;
  text: string;
  textLight: string;
  white: string;
  levelColors: readonly string[];
}

export type AppTheme = typeof baseTheme & { colors: ColorPalette };
