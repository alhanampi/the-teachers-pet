import { useMemo, useState } from "react";
import type { WordOrderExercise } from "../../../types/exercise";
import { shuffleArray } from "../../../lib/shuffle";
import { Button } from "../../ui/Button";
import { Prompt } from "../Prompt";
import { Chip, Row } from "./WordOrder.styles";

interface Props {
  exercise: WordOrderExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

export function WordOrder({ exercise, onComplete, disabled }: Props) {
  const shuffled = useMemo(() => shuffleArray(exercise.words), [exercise.words]);
  const [available, setAvailable] = useState(shuffled);
  const [chosen, setChosen] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const pick = (word: string, index: number) => {
    if (disabled || answered) return;
    const next = [...chosen, word];
    setChosen(next);
    setAvailable(available.filter((_, i) => i !== index));
    if (next.length === exercise.words.length) {
      setAnswered(true);
      onComplete(next.join(" ").toLowerCase() === exercise.answer.toLowerCase());
    }
  };

  const reset = () => {
    if (disabled || answered) return;
    setAvailable(shuffled);
    setChosen([]);
  };

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>
      <Row>
        {chosen.length === 0 && !answered && (
          <span role="img" aria-hidden>
            👉
          </span>
        )}
        {chosen.map((word, i) => (
          <Chip key={`${word}-${i}`} type="button" disabled>
            {word}
          </Chip>
        ))}
      </Row>
      <Row>
        {available.map((word, i) => (
          <Chip
            key={`${word}-${i}`}
            type="button"
            onClick={() => pick(word, i)}
            disabled={disabled || answered}
          >
            {word}
          </Chip>
        ))}
      </Row>
      {!answered && chosen.length > 0 && (
        <Button type="button" $variant="secondary" onClick={reset}>
          Start over
        </Button>
      )}
    </div>
  );
}
