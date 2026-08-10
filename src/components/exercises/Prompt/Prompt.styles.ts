import styled from "styled-components";

export const StyledPrompt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;
