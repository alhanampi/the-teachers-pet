import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { AuthWrapper } from "./Auth.styles";

export function Auth() {
  const { isLoaded, isSignedIn } = useAuth();
  const theme = useTheme();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Screen>
      <Title>Teacher login</Title>
      <Subtitle>Sign in to manage students and exercises</Subtitle>
      <AuthWrapper>
        <SignIn
          routing="virtual"
          forceRedirectUrl="/admin/dashboard"
          appearance={{
            variables: {
              colorPrimary: theme.colors.primary,
              colorText: theme.colors.text,
              colorBackground: theme.colors.surface,
              borderRadius: theme.radii.md,
              fontFamily: theme.fonts.body,
            },
          }}
        />
      </AuthWrapper>
    </Screen>
  );
}
