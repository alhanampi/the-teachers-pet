import { useState, type KeyboardEvent } from "react";
import type { FillBlankExercise } from "../../../types/exercise";
import { Button } from "../../ui/Button";
import { Prompt } from "../Prompt";
import { Input } from "./FillBlank.styles";

interface Props {
  exercise: FillBlankExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

export function FillBlank({ exercise, onComplete, disabled }: Props) {
  const [value, setValue] = useState("");
  const [answered, setAnswered] = useState(false);

  const check = () => {
    if (disabled || answered || !value.trim()) return;
    setAnswered(true);
    onComplete(value.trim().toLowerCase() === exercise.answer.toLowerCase());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") check();
  };

  return (
    <div>
      <Prompt hint={exercise.hint}>{exercise.prompt}</Prompt>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || answered}
        placeholder="Type your answer"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
      />
      {!disabled && !answered && value.trim() && (
        <Button type="button" $variant="secondary" onClick={check}>
          Check
        </Button>
      )}
    </div>
  );
}
