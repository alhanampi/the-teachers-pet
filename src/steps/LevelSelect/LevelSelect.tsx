import { useStudent } from "../../state/StudentContext";
import { CardGrid, Screen, Subtitle, Title } from "../../components/ui/Screen";
import type { Level } from "../../types/exercise";
import { LevelCard } from "./LevelSelect.styles";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelSelect() {
  const { name, selectLevel } = useStudent();

  return (
    <Screen>
      <Title>Hi, {name}! 👋</Title>
      <Subtitle>Which level do you want to practice?</Subtitle>
      <CardGrid>
        {LEVELS.map((level, index) => (
          <LevelCard key={level} $index={index} onClick={() => selectLevel(level)}>
            {level}
          </LevelCard>
        ))}
      </CardGrid>
    </Screen>
  );
}
