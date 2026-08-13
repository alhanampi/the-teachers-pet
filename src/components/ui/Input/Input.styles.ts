import styled from "styled-components";

export const StyledInput = styled.input<{ $compact?: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme, $compact }) => ($compact ? theme.fontSizes.sm : theme.fontSizes.md)};
  min-height: ${({ $compact }) => ($compact ? "40px" : "44px")};
  padding: ${({ theme, $compact }) =>
    $compact ? `${theme.spacing.xs} ${theme.spacing.sm}` : theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ $compact }) => ($compact ? "2px" : "3px")} solid
    ${({ theme }) => theme.colors.secondary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
