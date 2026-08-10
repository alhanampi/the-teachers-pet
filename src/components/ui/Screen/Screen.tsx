import type { ComponentProps } from "react";
import { StyledCardGrid, StyledScreen, StyledSubtitle, StyledTitle } from "./Screen.styles";

export function Screen(props: ComponentProps<typeof StyledScreen>) {
  return <StyledScreen {...props} />;
}

export function Title(props: ComponentProps<typeof StyledTitle>) {
  return <StyledTitle {...props} />;
}

export function Subtitle(props: ComponentProps<typeof StyledSubtitle>) {
  return <StyledSubtitle {...props} />;
}

export function CardGrid(props: ComponentProps<typeof StyledCardGrid>) {
  return <StyledCardGrid {...props} />;
}
