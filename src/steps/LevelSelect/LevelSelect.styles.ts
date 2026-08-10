import styled from "styled-components";

export const LevelCard = styled.button<{ $index: number }>`
  background: ${({ theme, $index }) => theme.colors.levelColors[$index]};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: none;
  }
`;
