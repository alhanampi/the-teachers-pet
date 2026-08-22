import type { AttemptRecord } from "../types/admin";

export interface GroupSummary {
  key: string;
  label: string;
  total: number;
  correct: number;
  accuracy: number;
}

export function summarizeByGroup(attempts: AttemptRecord[]): GroupSummary[] {
  const groups = new Map<string, { total: number; correct: number }>();

  for (const attempt of attempts) {
    const key = `${attempt.level} ${attempt.difficulty}`;
    const group = groups.get(key) ?? { total: 0, correct: 0 };
    group.total += 1;
    if (attempt.correct) group.correct += 1;
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, { total, correct }]) => ({
      key,
      label: key,
      total,
      correct,
      accuracy: correct / total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}
