import { Button } from "../Button";
import { Actions, Backdrop, Message, Panel } from "./ConfirmDialog.styles";

interface Props {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <Backdrop>
      <Panel>
        <Message>{message}</Message>
        <Actions>
          <Button type="button" $variant="success" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" $variant="secondary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Actions>
      </Panel>
    </Backdrop>
  );
}
