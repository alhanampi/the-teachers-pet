import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { AppThemeProvider } from "./state/ThemeContext.tsx";
import { GlobalStyle } from "./styles/GlobalStyle.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <GlobalStyle />
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
