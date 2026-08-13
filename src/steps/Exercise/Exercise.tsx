import { useEffect, useMemo, useState } from "react";
import type { Exercise as ExerciseType } from "../../types/exercise";
import { useStudent } from "../../state/StudentContext";
import { Screen, Subtitle } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { MultipleChoice } from "../../components/exercises/MultipleChoice";
import { FillBlank } from "../../components/exercises/FillBlank";
import { Matching } from "../../components/exercises/Matching";
import { WordOrder } from "../../components/exercises/WordOrder";
import { fetchExercises } from "../../lib/api";
import { shuffleArray } from "../../lib/shuffle";
import { Actions, Feedback } from "./Exercise.styles";

const ROUND_SIZE = 5;

function renderExercise(
  exercise: ExerciseType,
  attemptKey: string,
  onComplete: (correct: boolean) => void,
  disabled: boolean,
) {
  switch (exercise.type) {
    case "multiple-choice":
      return (
        <MultipleChoice
          key={attemptKey}
          exercise={exercise}
          onComplete={onComplete}
          disabled={disabled}
        />
      );
    case "fill-blank":
      return (
        <FillBlank
          key={attemptKey}
          exercise={exercise}
          onComplete={onComplete}
          disabled={disabled}
        />
      );
    case "matching":
      return (
        <Matching
          key={attemptKey}
          exercise={exercise}
          onComplete={onComplete}
          disabled={disabled}
        />
      );
    case "word-order":
      return (
        <WordOrder
          key={attemptKey}
          exercise={exercise}
          onComplete={onComplete}
          disabled={disabled}
        />
      );
  }
}

export function Exercise() {
  const { level, difficulty, completeExercise, finishExercises } = useStudent();

  const [exercises, setExercises] = useState<ExerciseType[] | null>(null);

  useEffect(() => {
    fetchExercises()
      .then(setExercises)
      .catch(() => setExercises([]));
  }, []);

  const pool = useMemo(() => {
    if (!exercises) return [];
    const matching = exercises.filter(
      (exercise) => exercise.level === level && exercise.difficulty === difficulty,
    );
    return shuffleArray(matching).slice(0, ROUND_SIZE);
  }, [exercises, level, difficulty]);

  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [pointAwarded, setPointAwarded] = useState(false);

  if (!exercises) {
    return (
      <Screen>
        <Subtitle>Loading exercises...</Subtitle>
      </Screen>
    );
  }

  const current = pool[index];

  if (!current) {
    return (
      <Screen>
        <Subtitle>
          There are no exercises for this level and difficulty yet. Try another combo!
        </Subtitle>
        <Button onClick={finishExercises}>Continue</Button>
      </Screen>
    );
  }

  const handleComplete = (correct: boolean) => {
    setFeedback(correct ? "correct" : "incorrect");
    if (!pointAwarded) {
      completeExercise(current.id, correct);
      setPointAwarded(true);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setAttempt((value) => value + 1);
  };

  const handleNext = () => {
    setFeedback(null);
    setAttempt(0);
    setPointAwarded(false);
    if (index + 1 < pool.length) {
      setIndex(index + 1);
    } else {
      finishExercises();
    }
  };

  return (
    <Screen>
      <Subtitle>
        Exercise {index + 1} of {pool.length}
      </Subtitle>
      <Card>
        {renderExercise(current, `${current.id}-${attempt}`, handleComplete, feedback !== null)}
        {feedback && (
          <Feedback $correct={feedback === "correct"}>
            {feedback === "correct" ? "Great job! 🎉" : "Almost! Keep practicing 💪"}
          </Feedback>
        )}
        {feedback && (
          <Actions>
            {feedback === "incorrect" && <Button onClick={handleRetry}>Try again</Button>}
            <Button
              $variant={feedback === "incorrect" ? "secondary" : "primary"}
              onClick={handleNext}
            >
              {index + 1 < pool.length ? "Next" : "See results"}
            </Button>
          </Actions>
        )}
      </Card>
    </Screen>
  );
}
