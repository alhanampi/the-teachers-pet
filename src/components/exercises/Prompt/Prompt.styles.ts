import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  position: relative;
`;

export const StyledPrompt = styled.p<{ $hasHint?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  margin: 0 0 ${({ theme }) => theme.spacing.lg};

  ${({ $hasHint, theme }) =>
    $hasHint &&
    css`
      padding-right: calc(32px + ${theme.spacing.sm});
    `}
`;
