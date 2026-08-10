import styled from "styled-components";
import { media } from "../../../styles/theme";

export const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.15);
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 480px;

  ${media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;
