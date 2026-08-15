import styled from "styled-components";
import { pressable } from "../../../styles/interactive";

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  min-height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Chip = styled.button<{ $used?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  background: ${({ theme, $used }) => ($used ? theme.colors.background : theme.colors.secondary)};
  color: ${({ theme, $used }) => ($used ? theme.colors.textLight : theme.colors.white)};
  cursor: pointer;
  ${pressable}

  &:disabled {
    opacity: ${({ $used }) => ($used ? 1 : 0.5)};
    cursor: default;
  }
`;

export const ChosenChip = styled(Chip)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const DragGhost = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: 0;
  left: 0;
  transform: translate(${({ $x }) => $x}px, ${({ $y }) => $y}px) translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  opacity: 0.95;
`;

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
