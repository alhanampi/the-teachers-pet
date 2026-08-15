import { css } from "styled-components";

export const pressable = css`
  transition: transform 0.1s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: none;
  }
`;
