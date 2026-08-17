import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useTheme } from "styled-components";
import { ConsentInterstitial } from "../../components/student/ConsentInterstitial";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { AuthWrapper, SwitchModeButton } from "./StudentAuth.styles";

type Mode = "signIn" | "signUp";

export function StudentAuth() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [consentGiven, setConsentGiven] = useState(false);
  const theme = useTheme();

  if (mode === "signUp" && !consentGiven) {
    return (
      <ConsentInterstitial
        onApprove={() => setConsentGiven(true)}
        onDecline={() => setMode("signIn")}
      />
    );
  }

  const appearance = {
    variables: {
      colorPrimary: theme.colors.primary,
      colorText: theme.colors.text,
      colorBackground: theme.colors.surface,
      borderRadius: theme.radii.md,
      fontFamily: theme.fonts.body,
    },
  };

  return (
    <Screen>
      <Title>Teacher's Pet</Title>
      <Subtitle>
        {mode === "signIn" ? "Sign in to keep playing" : "Pick a username and password"}
      </Subtitle>
      <AuthWrapper>
        {mode === "signIn" ? (
          <SignIn routing="virtual" appearance={appearance} />
        ) : (
          <SignUp routing="virtual" appearance={appearance} />
        )}
      </AuthWrapper>
      <SwitchModeButton
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
      >
        {mode === "signIn" ? "New here? Create an account" : "Already have an account? Sign in"}
      </SwitchModeButton>
    </Screen>
  );
}
