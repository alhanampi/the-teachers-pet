import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { StudentProvider, useStudent } from "../../state/StudentContext";
import { Header } from "../../components/layout/Header";
import { Screen, Subtitle } from "../../components/ui/Screen";
import { StudentAuth } from "../StudentAuth";
import { Onboarding } from "../../steps/Onboarding";
import { LevelSelect } from "../../steps/LevelSelect";
import { DifficultySelect } from "../../steps/DifficultySelect";
import { Exercise } from "../../steps/Exercise";
import { Summary } from "../../steps/Summary";

function StudentSteps() {
  const { step } = useStudent();

  return (
    <>
      <Header />
      {step === "onboarding" && <Onboarding />}
      {step === "level" && <LevelSelect />}
      {step === "difficulty" && <DifficultySelect />}
      {step === "exercise" && <Exercise />}
      {step === "summary" && <Summary />}
    </>
  );
}

export function StudentFlow() {
  const { isLoaded, isSignedIn } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  if (!isLoaded) {
    return (
      <Screen>
        <Subtitle>Loading...</Subtitle>
      </Screen>
    );
  }

  if (isSignedIn) {
    return (
      <StudentProvider>
        <StudentSteps />
      </StudentProvider>
    );
  }

  if (guestMode) {
    return (
      <StudentProvider guest onExitGuest={() => setGuestMode(false)}>
        <StudentSteps />
      </StudentProvider>
    );
  }

  return <StudentAuth onPlayAsGuest={() => setGuestMode(true)} />;
}
