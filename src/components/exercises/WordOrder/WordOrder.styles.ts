import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  min-height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Chip = styled.button`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
