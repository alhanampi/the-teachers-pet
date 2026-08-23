import { useState } from "react";
import type { MultipleChoiceExercise } from "../../../types/exercise";
import { Prompt } from "../Prompt";
import { Options, OptionButton, type OptionState } from "./MultipleChoice.styles";

interface Props {
  exercise: MultipleChoiceExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

export function MultipleChoice({ exercise, onComplete, disabled }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled || selected) return;
    setSelected(option);
    onComplete(option === exercise.answer);
  };

  return (
    <div>
      <Prompt hint={exercise.hint}>{exercise.prompt}</Prompt>
      <Options>
        {exercise.options.map((option) => {
          let state: OptionState = "neutral";
          if (selected) {
            if (option === exercise.answer) state = "correct";
            else if (option === selected) state = "incorrect";
          }
          return (
            <OptionButton
              key={option}
              type="button"
              $state={state}
              disabled={disabled || !!selected}
              onClick={() => handleSelect(option)}
            >
              {option}
            </OptionButton>
          );
        })}
      </Options>
    </div>
  );
}
