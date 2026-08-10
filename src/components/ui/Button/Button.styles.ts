import styled, { css } from "styled-components";

export type ButtonVariant = "primary" | "secondary" | "success";

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.button} ${({ theme }) => theme.colors.primaryDark};
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: ${({ theme }) => theme.shadows.button} ${({ theme }) => theme.colors.secondaryDark};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success};
    box-shadow: ${({ theme }) => theme.shadows.button} ${({ theme }) => theme.colors.successDark};
  `,
};

export const StyledButton = styled.button<{ $variant?: ButtonVariant }>`
  ${({ $variant = "primary" }) => variantStyles[$variant]}
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  cursor: pointer;
  transition: transform 0.1s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
