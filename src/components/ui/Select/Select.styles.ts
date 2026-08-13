import styled from "styled-components";

export const Wrapper = styled.label<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme, $compact }) => ($compact ? "0.8rem" : theme.fontSizes.sm)};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  min-width: 0;
`;

export const StyledSelect = styled.select<{ $compact?: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme, $compact }) => ($compact ? "0.85rem" : theme.fontSizes.sm)};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme, $compact }) =>
    $compact
      ? `${theme.spacing.xs} ${theme.spacing.sm}`
      : `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-height: ${({ $compact }) => ($compact ? "40px" : "44px")};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
