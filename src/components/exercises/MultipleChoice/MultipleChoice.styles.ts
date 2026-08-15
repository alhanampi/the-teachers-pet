import styled from "styled-components";
import { pressable } from "../../../styles/interactive";

export type OptionState = "neutral" | "correct" | "incorrect";

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const OptionButton = styled.button<{ $state: OptionState }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 3px solid
    ${({ theme, $state }) =>
      $state === "correct"
        ? theme.colors.success
        : $state === "incorrect"
          ? theme.colors.error
          : theme.colors.secondary};
  background: ${({ theme, $state }) =>
    $state === "correct"
      ? theme.colors.success
      : $state === "incorrect"
        ? theme.colors.error
        : theme.colors.white};
  color: ${({ theme, $state }) => ($state === "neutral" ? theme.colors.text : theme.colors.white)};
  cursor: pointer;
  ${pressable}

  &:disabled {
    cursor: default;
  }
`;
