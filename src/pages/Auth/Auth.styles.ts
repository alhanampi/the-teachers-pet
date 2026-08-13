import styled from "styled-components";
import { media } from "../../styles/theme";

export const Form = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.15);
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  ${media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

export const ErrorMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
