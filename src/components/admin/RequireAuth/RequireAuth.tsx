import { useClerk } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import { useTeacherSession } from "../../../lib/useTeacherSession";
import { Screen, Subtitle } from "../../ui/Screen";
import { Button } from "../../ui/Button";

export function RequireAuth() {
  const session = useTeacherSession();
  const { signOut } = useClerk();

  if (session.kind === "loading") {
    return (
      <Screen>
        <Subtitle>Loading...</Subtitle>
      </Screen>
    );
  }

  if (session.kind === "signed-out") {
    return <Navigate to="/auth" replace />;
  }

  if (session.kind === "not-linked") {
    return (
      <Screen>
        <Subtitle>
          Your account isn't linked to a teacher profile yet. Ask the administrator to set this up,
          then sign in again.
        </Subtitle>
        <Button onClick={() => signOut({ redirectUrl: "/auth" })}>Sign out</Button>
      </Screen>
    );
  }

  return <Outlet />;
}
