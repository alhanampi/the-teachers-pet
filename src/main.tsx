import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { StudentProvider } from "./state/StudentContext.tsx";
import { AppThemeProvider } from "./state/ThemeContext.tsx";
import { GlobalStyle } from "./styles/GlobalStyle.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <GlobalStyle />
      <StudentProvider>
        <App />
      </StudentProvider>
    </AppThemeProvider>
  </StrictMode>,
);
