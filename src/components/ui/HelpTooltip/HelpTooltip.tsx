import type { ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Arrow, Body, Content, Title, Trigger } from "./HelpTooltip.styles";

interface Props {
  title: string;
  children: ReactNode;
  icon?: string;
  ariaLabel?: string;
}

export function HelpTooltip({ title, children, icon = "?", ariaLabel = "Help" }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Trigger type="button" aria-label={ariaLabel}>
          {icon}
        </Trigger>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content asChild sideOffset={8} collisionPadding={16}>
          <Content>
            <Title>{title}</Title>
            <Body>{children}</Body>
            <Arrow />
          </Content>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
