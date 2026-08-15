import styled from "styled-components";
import { pressable } from "../../styles/interactive";

export const DifficultyCard = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.md};
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  box-shadow: 0 5px 0 ${({ theme }) => theme.colors.secondaryDark};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  ${pressable}
`;

export const Emoji = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;
