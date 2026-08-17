import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { useViewportHeightSync } from "./lib/useViewportHeightSync";
import { useButtonClickSound } from "./lib/sound";
import { RequireAuth } from "./components/admin/RequireAuth";
import { TeacherClerkProvider } from "./components/admin/TeacherClerkProvider";
import { AdminLayout } from "./components/admin/AdminLayout";
import { StudentClerkProvider } from "./components/student/StudentClerkProvider";
import { StudentFlow } from "./pages/StudentFlow";
import { Auth } from "./pages/Auth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminStudentDetail } from "./pages/AdminStudentDetail";
import { AdminExercises } from "./pages/AdminExercises";

export function App() {
  useViewportHeightSync();
  useButtonClickSound();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StudentClerkProvider />}>
          <Route path="/" element={<StudentFlow />} />
        </Route>
        <Route element={<TeacherClerkProvider />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard/:studentId" element={<AdminStudentDetail />} />
              <Route path="/admin/exercises" element={<AdminExercises />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
