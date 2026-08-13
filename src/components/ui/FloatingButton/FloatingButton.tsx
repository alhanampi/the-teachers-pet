import type { ButtonHTMLAttributes } from "react";
import type { ButtonVariant } from "../Button/Button.styles";
import { StyledFloatingButton } from "./FloatingButton.styles";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: ButtonVariant;
}

export function FloatingButton({ $variant, ...rest }: Props) {
  return <StyledFloatingButton $variant={$variant} {...rest} />;
}
