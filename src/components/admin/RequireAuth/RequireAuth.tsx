import { Navigate, Outlet } from "react-router-dom";
import { useTeacher } from "../../../state/TeacherContext";
import { Screen, Subtitle } from "../../ui/Screen";

export function RequireAuth() {
  const { status } = useTeacher();

  if (status === "loading") {
    return (
      <Screen>
        <Subtitle>Loading...</Subtitle>
      </Screen>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
