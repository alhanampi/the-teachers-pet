import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTeacher } from "../../../state/TeacherContext";
import {
  Bar,
  Content,
  LogoutButton,
  Nav,
  NavLink,
  RightGroup,
  Root,
  TeacherName,
} from "./AdminLayout.styles";

export function AdminLayout() {
  const { teacherName, logout } = useTeacher();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <Root>
      <Bar>
        <Nav>
          <NavLink
            type="button"
            $active={location.pathname.startsWith("/admin/dashboard")}
            onClick={() => navigate("/admin/dashboard")}
          >
            Students
          </NavLink>
          <NavLink
            type="button"
            $active={location.pathname.startsWith("/admin/exercises")}
            onClick={() => navigate("/admin/exercises")}
          >
            Exercises
          </NavLink>
        </Nav>
        <RightGroup>
          {teacherName && <TeacherName>{teacherName}</TeacherName>}
          <LogoutButton type="button" onClick={handleLogout}>
            Log out
          </LogoutButton>
        </RightGroup>
      </Bar>
      <Content>
        <Outlet />
      </Content>
    </Root>
  );
}
