import styled from "styled-components";
import { pressable } from "../../../styles/interactive";

export const Bar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.tabBarHeight};
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 -2px 0 rgba(0, 0, 0, 0.06);
  z-index: 20;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: none;
  cursor: pointer;
  min-height: 44px;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme, $active }) => ($active ? theme.colors.primaryDark : theme.colors.textLight)};
  ${pressable}
`;

export const TabIcon = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1;
`;

export const TabLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
`;
