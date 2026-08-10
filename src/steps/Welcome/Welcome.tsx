import { useState, type FormEvent } from "react";
import { useStudent } from "../../state/StudentContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { Input, Mascot } from "./Welcome.styles";

export function Welcome() {
  const { submitName } = useStudent();
  const [name, setName] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    submitName(trimmed);
  };

  return (
    <Screen>
      <Mascot role="img" aria-label="mascot">
        🦉
      </Mascot>
      <Title>Hi! Let's learn English</Title>
      <Subtitle>Type your name to start</Subtitle>
      <Card as="form" onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          maxLength={40}
          autoFocus
        />
        <Button type="submit" disabled={!name.trim()}>
          Start!
        </Button>
      </Card>
    </Screen>
  );
}
