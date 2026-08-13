export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Difficulty = "easy" | "medium" | "hard";

interface ExerciseBase {
  id: string;
  level: Level;
  difficulty: Difficulty;
  prompt: string;
  hint?: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple-choice";
  options: string[];
  answer: string;
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill-blank";
  answer: string;
}

export interface MatchingExercise extends ExerciseBase {
  type: "matching";
  pairs: { left: string; right: string }[];
}

export interface WordOrderExercise extends ExerciseBase {
  type: "word-order";
  words: string[];
  answer: string;
}

export type Exercise =
  MultipleChoiceExercise | FillBlankExercise | MatchingExercise | WordOrderExercise;
