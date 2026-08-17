import { useStudent } from "../../state/StudentContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { Actions, Stars } from "./Summary.styles";

export function Summary() {
  const { name, points, playAgain, signOut } = useStudent();

  return (
    <Screen>
      <Stars role="img" aria-label="stars">
        🌟🌟🌟
      </Stars>
      <Title>Great job, {name}!</Title>
      <Card>
        <Subtitle>You have {points} points in total</Subtitle>
        <Actions>
          <Button onClick={playAgain}>Play again</Button>
          <Button $variant="secondary" onClick={signOut}>
            Log out
          </Button>
        </Actions>
      </Card>
    </Screen>
  );
}
