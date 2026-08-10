import type { ButtonHTMLAttributes } from "react";
import { StyledButton, type ButtonVariant } from "./Button.styles";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: ButtonVariant;
}

export function Button({ $variant, ...rest }: Props) {
  return <StyledButton $variant={$variant} {...rest} />;
}
