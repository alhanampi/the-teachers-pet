import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Mascot = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
  }
`;

export const Body = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  max-width: 420px;

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  max-width: 320px;
`;
