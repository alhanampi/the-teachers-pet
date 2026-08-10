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

export function Header() {
  const { step, name, points, goBack, changeName } = useStudent();
  const { themeId, setThemeId } = useAppTheme();
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeId(event.target.value);
  };

  const canGoBack = step === "level" || step === "difficulty" || step === "exercise";

  const handleBack = () => {
    const needsConfirm = step === "exercise" || (step === "level" && points > 0);
    if (needsConfirm) {
      setPendingNav("back");
    } else {
      goBack();
    }
  };

  const handleLogoClick = () => {
    if (step === "welcome") return;
    const needsConfirm = step === "exercise" || points > 0;
    if (needsConfirm) {
      setPendingNav("home");
    } else {
      changeName();
    }
  };

  const confirmPendingNav = () => {
    if (pendingNav === "back") goBack();
    if (pendingNav === "home") changeName();
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
        <Logo type="button" onClick={handleLogoClick} aria-label="Go to home screen">
          <LogoIcon src="/icons/apple.svg" alt="" />
          <LogoText>Teacher's Pet</LogoText>
        </Logo>
        {step !== "welcome" && <Greeting>Hi {name}!</Greeting>}
      </LeftGroup>
      <Controls>
        {step !== "welcome" && (
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
