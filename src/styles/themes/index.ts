import type { AppTheme } from "../theme";
import { coralTheme } from "./coral";
import { oceanTheme } from "./ocean";
import { forestTheme } from "./forest";
import { sunsetTheme } from "./sunset";
import { galaxyTheme } from "./galaxy";

export interface ThemeOption {
  id: string;
  label: string;
  emoji: string;
  theme: AppTheme;
}

export const themeOptions: ThemeOption[] = [
  { id: "coral", label: "Coral", emoji: "🪸", theme: coralTheme },
  { id: "ocean", label: "Ocean", emoji: "🌊", theme: oceanTheme },
  { id: "forest", label: "Forest", emoji: "🌲", theme: forestTheme },
  { id: "sunset", label: "Sunset", emoji: "🌅", theme: sunsetTheme },
  { id: "galaxy", label: "Galaxy", emoji: "🌌", theme: galaxyTheme },
];

export const defaultThemeId = themeOptions[0].id;
