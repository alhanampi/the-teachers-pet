import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Root = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.06);
`;

export const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};

  ${media.tablet} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const NavLink = styled.button<{ $active?: boolean }>`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.text)};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  min-height: 40px;
  cursor: pointer;
`;

export const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const TeacherName = styled.span`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  display: none;

  ${media.tablet} {
    display: inline;
  }
`;

export const LogoutButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
`;

export const Content = styled.main`
  flex: 1 1 auto;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};

  ${media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;
