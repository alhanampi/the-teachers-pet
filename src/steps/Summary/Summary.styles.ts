import styled from "styled-components";
import { media } from "../../styles/theme";

export const Stars = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;
