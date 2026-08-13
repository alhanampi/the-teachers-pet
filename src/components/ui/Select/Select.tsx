import type { SelectHTMLAttributes } from "react";
import { StyledSelect, Wrapper } from "./Select.styles";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  $compact?: boolean;
}

export function Select({ label, options, $compact, ...rest }: Props) {
  return (
    <Wrapper $compact={$compact}>
      {label}
      <StyledSelect $compact={$compact} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </Wrapper>
  );
}
