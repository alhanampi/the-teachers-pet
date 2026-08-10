import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.headerHeight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.06);
  z-index: 20;
`;

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1 1 auto;
  min-width: 0;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1;
  cursor: pointer;
`;

export const Logo = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primaryDark};
  white-space: nowrap;
  cursor: pointer;
`;

export const LogoIcon = styled.img`
  width: 28px;
  height: 28px;
`;

export const LogoText = styled.span`
  display: none;

  ${media.tablet} {
    display: inline;
  }
`;

export const Greeting = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;

  ${media.tablet} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const PointsPill = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`;

export const ThemeSelect = styled.select`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-height: 36px;
  max-width: 120px;

  ${media.tablet} {
    max-width: none;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;
