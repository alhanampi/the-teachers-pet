import type { Difficulty, Level } from "./exercise";

export interface Student {
  id: string;
  name: string;
  points: number;
  createdAt: string;
}

export interface AttemptRecord {
  id: string;
  exerciseId: string;
  level: Level;
  difficulty: Difficulty;
  correct: boolean;
  createdAt: string;
  prompt: string | null;
  type: string | null;
}
