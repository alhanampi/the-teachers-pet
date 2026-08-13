import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "../Button";
import { Actions, Message, Overlay, StyledContent } from "./ConfirmDialog.styles";

interface Props {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay asChild>
          <Overlay />
        </AlertDialog.Overlay>
        <AlertDialog.Content asChild>
          <StyledContent>
            <AlertDialog.Title asChild>
              <Message>{message}</Message>
            </AlertDialog.Title>
            <Actions>
              <AlertDialog.Cancel asChild>
                <Button type="button" $variant="success" onClick={onCancel}>
                  {cancelLabel}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button type="button" $variant="secondary" onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              </AlertDialog.Action>
            </Actions>
          </StyledContent>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
