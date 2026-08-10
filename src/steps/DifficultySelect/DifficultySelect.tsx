import { useStudent } from "../../state/StudentContext";
import { CardGrid, Screen, Subtitle, Title } from "../../components/ui/Screen";
import type { Difficulty } from "../../types/exercise";
import { DifficultyCard, Emoji } from "./DifficultySelect.styles";

const DIFFICULTIES: { value: Difficulty; label: string; emoji: string }[] = [
  { value: "easy", label: "Easy", emoji: "🌱" },
  { value: "medium", label: "Medium", emoji: "🔥" },
  { value: "hard", label: "Hard", emoji: "🚀" },
];

export function DifficultySelect() {
  const { level, selectDifficulty } = useStudent();

  return (
    <Screen>
      <Title>Level {level}</Title>
      <Subtitle>Which difficulty do you want to play?</Subtitle>
      <CardGrid>
        {DIFFICULTIES.map(({ value, label, emoji }) => (
          <DifficultyCard key={value} onClick={() => selectDifficulty(value)}>
            <Emoji role="img" aria-hidden>
              {emoji}
            </Emoji>
            {label}
          </DifficultyCard>
        ))}
      </CardGrid>
    </Screen>
  );
}
