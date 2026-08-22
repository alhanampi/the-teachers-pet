import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { StudentProvider, useStudent } from "../../state/StudentContext";
import { Header } from "../../components/layout/Header";
import { TabBar, type TabId } from "../../components/layout/TabBar";
import { Screen, Subtitle } from "../../components/ui/Screen";
import { StudentAuth } from "../StudentAuth";
import { Onboarding } from "../../steps/Onboarding";
import { LevelSelect } from "../../steps/LevelSelect";
import { DifficultySelect } from "../../steps/DifficultySelect";
import { Exercise } from "../../steps/Exercise";
import { Summary } from "../../steps/Summary";
import { Vocabulary } from "../../tabs/Vocabulary";
import { Stats } from "../../tabs/Stats";

function QuizzesBody() {
  const { step } = useStudent();

  return (
    <>
      {step === "onboarding" && <Onboarding />}
      {step === "level" && <LevelSelect />}
      {step === "difficulty" && <DifficultySelect />}
      {step === "exercise" && <Exercise />}
      {step === "summary" && <Summary />}
    </>
  );
}

function StudentTabs() {
  const { isGuest, step } = useStudent();
  const [activeTab, setActiveTab] = useState<TabId>("quizzes");

  return (
    <>
      <Header quizTabActive={activeTab === "quizzes"} />
      {activeTab === "quizzes" && <QuizzesBody />}
      {activeTab === "vocabulary" && <Vocabulary />}
      {activeTab === "stats" && !isGuest && <Stats />}
      {step !== "onboarding" && (
        <TabBar active={activeTab} onChange={setActiveTab} showStats={!isGuest} />
      )}
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
        <StudentTabs />
      </StudentProvider>
    );
  }

  if (guestMode) {
    return (
      <StudentProvider guest onExitGuest={() => setGuestMode(false)}>
        <StudentTabs />
      </StudentProvider>
    );
  }

  return <StudentAuth onPlayAsGuest={() => setGuestMode(true)} />;
}
