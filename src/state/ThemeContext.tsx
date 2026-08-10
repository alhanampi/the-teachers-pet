import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { defaultThemeId, themeOptions } from "../styles/themes";

const STORAGE_KEY = "englishApp.themeId";

interface ThemeContextValue {
  themeId: string;
  setThemeId: (id: string) => void;
}

const AppThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredThemeId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return themeOptions.some((option) => option.id === stored) ? (stored as string) : defaultThemeId;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(readStoredThemeId);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeTheme = useMemo(
    () => themeOptions.find((option) => option.id === themeId)?.theme ?? themeOptions[0].theme,
    [themeId],
  );

  return (
    <AppThemeContext.Provider value={{ themeId, setThemeId }}>
      <ThemeProvider theme={activeTheme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its Provider, standard Context pattern
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within an AppThemeProvider");
  return ctx;
}
