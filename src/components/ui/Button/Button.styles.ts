import styled, { css } from "styled-components";
import { pressable } from "../../../styles/interactive";

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
  ${pressable}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
