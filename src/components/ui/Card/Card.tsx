import type { ComponentProps } from "react";
import { StyledCard } from "./Card.styles";

type Props = ComponentProps<typeof StyledCard>;

export function Card(props: Props) {
  return <StyledCard {...props} />;
}
