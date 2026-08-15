import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App.tsx";
import { StudentProvider } from "./state/StudentContext.tsx";
import { AppThemeProvider } from "./state/ThemeContext.tsx";
import { GlobalStyle } from "./styles/GlobalStyle.ts";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} signInUrl="/auth" afterSignOutUrl="/auth">
      <AppThemeProvider>
        <GlobalStyle />
        <StudentProvider>
          <App />
        </StudentProvider>
      </AppThemeProvider>
    </ClerkProvider>
  </StrictMode>,
);
