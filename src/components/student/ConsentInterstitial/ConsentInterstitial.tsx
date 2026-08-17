import { Button } from "../../ui/Button";
import { Screen, Subtitle, Title } from "../../ui/Screen";
import { Actions, Body, Mascot } from "./ConsentInterstitial.styles";

interface Props {
  onApprove: () => void;
  onDecline: () => void;
}

export function ConsentInterstitial({ onApprove, onDecline }: Props) {
  return (
    <Screen>
      <Mascot role="img" aria-label="mascot">
        🦉
      </Mascot>
      <Title>Before you sign up</Title>
      <Subtitle>A quick note for parents and guardians</Subtitle>
      <Body>
        We only save a username and your child's academic history (level, exercises completed,
        points) — nothing else. This is just so their teacher can follow their progress. No email is
        required to play.
      </Body>
      <Actions>
        <Button type="button" onClick={onApprove}>
          I understand, continue
        </Button>
        <Button type="button" $variant="secondary" onClick={onDecline}>
          Not now
        </Button>
      </Actions>
    </Screen>
  );
}
