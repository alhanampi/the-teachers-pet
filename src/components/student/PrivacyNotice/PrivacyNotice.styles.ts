import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Body = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textLight};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;
