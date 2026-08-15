import { UserButton, useUser } from "@clerk/clerk-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { Bar, Content, Nav, NavLink, RightGroup, Root, TeacherName } from "./AdminLayout.styles";

export function AdminLayout() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const teacherName = user?.fullName || user?.primaryEmailAddress?.emailAddress || null;

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
          <UserButton
            appearance={{
              variables: {
                colorPrimary: theme.colors.primary,
                fontFamily: theme.fonts.body,
              },
            }}
          />
        </RightGroup>
      </Bar>
      <Content>
        <Outlet />
      </Content>
    </Root>
  );
}
