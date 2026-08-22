import { Bar, TabButton, TabIcon, TabLabel } from "./TabBar.styles";

export type TabId = "quizzes" | "vocabulary" | "stats";

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  showStats: boolean;
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "quizzes", icon: "🎯", label: "Quizzes" },
  { id: "vocabulary", icon: "📚", label: "Vocabulary" },
  { id: "stats", icon: "📊", label: "My Stats" },
];

export function TabBar({ active, onChange, showStats }: Props) {
  const tabs = TABS.filter((tab) => tab.id !== "stats" || showStats);

  return (
    <Bar>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          type="button"
          $active={active === tab.id}
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          <TabIcon aria-hidden="true">{tab.icon}</TabIcon>
          <TabLabel>{tab.label}</TabLabel>
        </TabButton>
      ))}
    </Bar>
  );
}
