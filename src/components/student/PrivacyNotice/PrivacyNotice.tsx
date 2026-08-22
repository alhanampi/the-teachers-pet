import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { Actions, Body } from "./PrivacyNotice.styles";

interface Props {
  onClose: () => void;
}

export function PrivacyNotice({ onClose }: Props) {
  return (
    <Modal title="🔒 Aviso de privacidad" onClose={onClose}>
      <Body>
        Teacher's Pet es una aplicación de uso interno escolar para la práctica de inglés. No se
        recopila información personal: únicamente se registran estadísticas de estudio (nivel,
        ejercicios completados, puntos) para que el docente pueda hacer seguimiento del progreso.
      </Body>
      <Actions>
        <Button type="button" $variant="success" $compact onClick={onClose}>
          Aceptar
        </Button>
      </Actions>
    </Modal>
  );
}
