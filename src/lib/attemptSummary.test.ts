import { describe, expect, it } from "vitest";
import { summarizeByGroup } from "./attemptSummary";
import type { AttemptRecord } from "../types/admin";

function attempt(overrides: Partial<AttemptRecord>): AttemptRecord {
  return {
    id: "attempt-id",
    exerciseId: "exercise-id",
    level: "A1",
    difficulty: "easy",
    correct: true,
    createdAt: "2026-01-01T00:00:00Z",
    prompt: null,
    type: null,
    ...overrides,
  };
}

describe("summarizeByGroup", () => {
  it("returns an empty array for no attempts", () => {
    expect(summarizeByGroup([])).toEqual([]);
  });

  it("groups by level and difficulty, computing total/correct/accuracy", () => {
    const attempts = [
      attempt({ level: "A1", difficulty: "easy", correct: true }),
      attempt({ level: "A1", difficulty: "easy", correct: false }),
      attempt({ level: "B1", difficulty: "medium", correct: true }),
    ];

    const summary = summarizeByGroup(attempts);

    expect(summary).toContainEqual({
      key: "A1 easy",
      label: "A1 easy",
      total: 2,
      correct: 1,
      accuracy: 0.5,
    });
    expect(summary).toContainEqual({
      key: "B1 medium",
      label: "B1 medium",
      total: 1,
      correct: 1,
      accuracy: 1,
    });
  });

  it("sorts groups ascending by accuracy, weakest first", () => {
    const attempts = [
      attempt({ level: "A1", difficulty: "easy", correct: true }),
      attempt({ level: "B1", difficulty: "hard", correct: false }),
      attempt({ level: "B1", difficulty: "hard", correct: false }),
      attempt({ level: "A2", difficulty: "medium", correct: true }),
      attempt({ level: "A2", difficulty: "medium", correct: false }),
    ];

    const summary = summarizeByGroup(attempts);

    expect(summary.map((group) => group.key)).toEqual(["B1 hard", "A2 medium", "A1 easy"]);
  });
});
