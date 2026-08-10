import { useStudent } from "./state/StudentContext";
import { useViewportHeightSync } from "./lib/useViewportHeightSync";
import { Header } from "./components/layout/Header";
import { Welcome } from "./steps/Welcome";
import { LevelSelect } from "./steps/LevelSelect";
import { DifficultySelect } from "./steps/DifficultySelect";
import { Exercise } from "./steps/Exercise";
import { Summary } from "./steps/Summary";

export function App() {
  const { step } = useStudent();
  useViewportHeightSync();

  return (
    <>
      <Header />
      {step === "welcome" && <Welcome />}
      {step === "level" && <LevelSelect />}
      {step === "difficulty" && <DifficultySelect />}
      {step === "exercise" && <Exercise />}
      {step === "summary" && <Summary />}
    </>
  );
}
