import styled from "styled-components";

export type ItemState = "neutral" | "selected" | "matched" | "wrong";

export const Columns = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Item = styled.button<{ $state: ItemState }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  min-height: 44px;
  min-width: 100px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 3px solid
    ${({ theme, $state }) =>
      $state === "matched"
        ? theme.colors.success
        : $state === "selected"
          ? theme.colors.primary
          : $state === "wrong"
            ? theme.colors.error
            : theme.colors.secondary};
  background: ${({ theme, $state }) =>
    $state === "matched"
      ? theme.colors.success
      : $state === "wrong"
        ? theme.colors.error
        : $state === "selected"
          ? theme.colors.background
          : theme.colors.white};
  color: ${({ theme, $state }) =>
    $state === "matched" || $state === "wrong" ? theme.colors.white : theme.colors.text};
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:disabled {
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
  min-width: 100px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 3px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  opacity: 0.95;
`;
