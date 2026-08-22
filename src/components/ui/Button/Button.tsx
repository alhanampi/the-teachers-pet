import type { ButtonHTMLAttributes } from "react";
import { StyledButton, type ButtonVariant } from "./Button.styles";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: ButtonVariant;
  $compact?: boolean;
}

export function Button({ $variant, $compact, ...rest }: Props) {
  return <StyledButton $variant={$variant} $compact={$compact} {...rest} />;
}
