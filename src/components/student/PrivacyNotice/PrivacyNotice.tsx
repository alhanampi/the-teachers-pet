import { Modal } from "../../ui/Modal";
import { Body } from "./PrivacyNotice.styles";

interface Props {
  onClose: () => void;
}

export function PrivacyNotice({ onClose }: Props) {
  return (
    <Modal title="Just so you know" onClose={onClose}>
      <Body>
        Teacher's Pet is an internal app for practicing English at school. We don't collect personal
        information — only study statistics (level, exercises completed, points) so a teacher can
        follow progress.
      </Body>
    </Modal>
  );
}
