import styled from "styled-components";

export const Feedback = styled.div<{ $correct: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 800;
  color: ${({ theme, $correct }) => ($correct ? theme.colors.successDark : theme.colors.primaryDark)};
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;
