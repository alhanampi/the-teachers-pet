import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "styled-components";
import { fetchMyAttempts } from "../../lib/studentApi";
import { summarizeByGroup } from "../../lib/attemptSummary";
import type { AttemptRecord } from "../../types/admin";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import {
  BigNumberCard,
  BigNumberLabel,
  BigNumberValue,
  BigNumbers,
  ChartCard,
  EncourageText,
} from "./Stats.styles";

export function Stats() {
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchMyAttempts()
      .then(setAttempts)
      .catch(() => setAttempts([]));
  }, []);

  const summary = useMemo(() => (attempts ? summarizeByGroup(attempts) : []), [attempts]);
  const totalCorrect = attempts?.filter((attempt) => attempt.correct).length ?? 0;
  const accuracy =
    attempts && attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : null;
  const weakestGroup = summary[0];

  if (!attempts) {
    return (
      <Screen>
        <Subtitle>Loading your stats...</Subtitle>
      </Screen>
    );
  }

  if (attempts.length === 0) {
    return (
      <Screen>
        <Title>My Stats 📊</Title>
        <Subtitle>Play some quizzes to see your stats here! 🎮</Subtitle>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>My Stats 📊</Title>
      <Subtitle>Look how much you've practiced!</Subtitle>
      <BigNumbers>
        <BigNumberCard>
          <BigNumberValue>{attempts.length}</BigNumberValue>
          <BigNumberLabel>Exercises done</BigNumberLabel>
        </BigNumberCard>
        <BigNumberCard>
          <BigNumberValue>{accuracy}%</BigNumberValue>
          <BigNumberLabel>Correct overall</BigNumberLabel>
        </BigNumberCard>
      </BigNumbers>
      <ChartCard>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summary} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [`${Math.round(Number(value))}%`, "Accuracy"]}
              cursor={{ fill: theme.colors.background }}
            />
            <Bar
              dataKey={(entry: { accuracy: number }) => Math.round(entry.accuracy * 100)}
              fill={theme.colors.primary}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      {weakestGroup && weakestGroup.accuracy < 0.7 && (
        <EncourageText>Let's practice {weakestGroup.label} together next time! 💪</EncourageText>
      )}
    </Screen>
  );
}
