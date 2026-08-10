import type { ComponentProps } from "react";
import { StyledPrompt } from "./Prompt.styles";

export function Prompt(props: ComponentProps<typeof StyledPrompt>) {
  return <StyledPrompt {...props} />;
}
