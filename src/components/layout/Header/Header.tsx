import { useState, type ChangeEvent } from "react";
import { useStudent } from "../../../state/StudentContext";
import { useAppTheme } from "../../../state/ThemeContext";
import { themeOptions } from "../../../styles/themes";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import {
  BackButton,
  Bar,
  Controls,
  Greeting,
  LeftGroup,
  Logo,
  LogoIcon,
  LogoText,
  PointsPill,
  ThemeSelect,
} from "./Header.styles";

type PendingNav = "back" | "home" | null;

interface Props {
  quizTabActive: boolean;
}

export function Header({ quizTabActive }: Props) {
  const { step, name, points, goBack, signOut } = useStudent();
  const { themeId, setThemeId } = useAppTheme();
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeId(event.target.value);
  };

  const canGoBack = quizTabActive && (step === "difficulty" || step === "exercise");

  const handleBack = () => {
    if (step === "exercise") {
      setPendingNav("back");
    } else {
      goBack();
    }
  };

  const handleLogoClick = () => {
    const needsConfirm = step === "exercise" || points > 0;
    if (needsConfirm) {
      setPendingNav("home");
    } else {
      signOut();
    }
  };

  const confirmPendingNav = () => {
    if (pendingNav === "back") goBack();
    if (pendingNav === "home") signOut();
    setPendingNav(null);
  };

  return (
    <Bar>
      <LeftGroup>
        {canGoBack && (
          <BackButton type="button" onClick={handleBack} aria-label="Go back">
            ←
          </BackButton>
        )}
        <Logo type="button" onClick={handleLogoClick} aria-label="Sign out">
          <LogoIcon src="/icons/apple.svg" alt="" />
          <LogoText>Teacher's Pet</LogoText>
        </Logo>
        {step !== "onboarding" && <Greeting>Hi {name}!</Greeting>}
      </LeftGroup>
      <Controls>
        {step !== "onboarding" && (
          <PointsPill>
            <span role="img" aria-label="star">
              ⭐
            </span>
            {points}
          </PointsPill>
        )}
        <ThemeSelect aria-label="Choose a color" value={themeId} onChange={handleThemeChange}>
          {themeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.emoji} {option.label}
            </option>
          ))}
        </ThemeSelect>
      </Controls>
      {pendingNav && (
        <ConfirmDialog
          message="You'll lose your current progress if you leave. Are you sure?"
          confirmLabel="Leave anyway"
          cancelLabel="Keep playing"
          onCancel={() => setPendingNav(null)}
          onConfirm={confirmPendingNav}
        />
      )}
    </Bar>
  );
}
