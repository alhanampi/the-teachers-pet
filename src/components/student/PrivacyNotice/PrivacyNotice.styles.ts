import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Body = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;
