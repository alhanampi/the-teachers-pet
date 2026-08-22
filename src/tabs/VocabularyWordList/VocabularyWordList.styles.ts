import styled from "styled-components";
import { pressable } from "../../styles/interactive";

export const BackRow = styled.button`
  align-self: flex-start;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  min-height: 44px;
  ${pressable}
`;

export const WordCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const WordIcon = styled.img`
  width: 64px;
  height: 64px;
`;

export const WordLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;
