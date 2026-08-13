import type { InputHTMLAttributes } from "react";
import { StyledInput } from "./Input.styles";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  $compact?: boolean;
}

export function Input({ $compact, ...props }: Props) {
  return <StyledInput $compact={$compact} {...props} />;
}
