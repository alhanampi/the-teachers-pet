import type { ComponentProps } from "react";
import { HelpTooltip } from "../../ui/HelpTooltip";
import { StyledPrompt, Wrapper } from "./Prompt.styles";

interface Props extends ComponentProps<typeof StyledPrompt> {
  hint?: string;
}

export function Prompt({ hint, ...props }: Props) {
  return (
    <Wrapper>
      <StyledPrompt {...props} $hasHint={!!hint} />
      {hint && (
        <HelpTooltip title="Need a hint? 💡" icon="💡" ariaLabel="Need a hint?">
          {hint}
        </HelpTooltip>
      )}
    </Wrapper>
  );
}
