import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseButton, Header, Overlay, StyledContent, StyledTitle } from "./Modal.styles";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <Overlay />
        </Dialog.Overlay>
        <Dialog.Content asChild aria-describedby={undefined}>
          <StyledContent>
            <Header>
              <Dialog.Title asChild>
                <StyledTitle>{title}</StyledTitle>
              </Dialog.Title>
              <Dialog.Close asChild>
                <CloseButton type="button" aria-label="Close">
                  ✕
                </CloseButton>
              </Dialog.Close>
            </Header>
            {children}
          </StyledContent>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
