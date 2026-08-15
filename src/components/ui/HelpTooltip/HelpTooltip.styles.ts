import * as Popover from "@radix-ui/react-popover";
import styled from "styled-components";
import { pressable } from "../../../styles/interactive";

export const Trigger = styled.button`
  position: absolute;
  top: -${({ theme }) => theme.spacing.xs};
  right: -${({ theme }) => theme.spacing.xs};
  z-index: 10;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button} ${({ theme }) => theme.colors.secondaryDark};
  ${pressable}
`;

export const Content = styled.div`
  z-index: 60;
  max-width: 280px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.2);
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  &:focus {
    outline: none;
  }
`;

export const Title = styled.p`
  margin: 0;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const Body = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const Arrow = styled(Popover.Arrow)`
  fill: ${({ theme }) => theme.colors.surface};
`;
