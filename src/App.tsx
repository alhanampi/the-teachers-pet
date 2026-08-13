import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { useViewportHeightSync } from "./lib/useViewportHeightSync";
import { RequireAuth } from "./components/admin/RequireAuth";
import { AdminLayout } from "./components/admin/AdminLayout";
import { StudentFlow } from "./pages/StudentFlow";
import { Auth } from "./pages/Auth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminStudentDetail } from "./pages/AdminStudentDetail";
import { AdminExercises } from "./pages/AdminExercises";

export function App() {
  useViewportHeightSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentFlow />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard/:studentId" element={<AdminStudentDetail />} />
            <Route path="/admin/exercises" element={<AdminExercises />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
