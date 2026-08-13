export const MAX_NAME_LENGTH = 40;
export const MAX_EXERCISE_ID_LENGTH = 100;
export const MAX_PROMPT_LENGTH = 300;
export const MAX_HINT_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 200;
export const MAX_OPTION_LENGTH = 100;
export const MAX_OPTIONS = 6;
export const MAX_PAIRS = 10;
export const MAX_WORDS = 20;
export const MAX_WORD_LENGTH = 40;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const EXERCISE_TYPES = ["multiple-choice", "fill-blank", "matching", "word-order"] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isValidLevel(value: unknown): value is (typeof LEVELS)[number] {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value);
}

export function isValidDifficulty(value: unknown): value is (typeof DIFFICULTIES)[number] {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

export function isValidExerciseType(value: unknown): value is (typeof EXERCISE_TYPES)[number] {
  return typeof value === "string" && (EXERCISE_TYPES as readonly string[]).includes(value);
}

export function isValidBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidOptions(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.length <= MAX_OPTIONS &&
    value.every((option) => isNonEmptyString(option, MAX_OPTION_LENGTH))
  );
}

export function isValidPairs(value: unknown): value is { left: string; right: string }[] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.length <= MAX_PAIRS &&
    value.every(
      (pair) =>
        typeof pair === "object" &&
        pair !== null &&
        isNonEmptyString((pair as { left?: unknown }).left, MAX_OPTION_LENGTH) &&
        isNonEmptyString((pair as { right?: unknown }).right, MAX_OPTION_LENGTH),
    )
  );
}

export function isValidWords(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.length <= MAX_WORDS &&
    value.every((word) => isNonEmptyString(word, MAX_WORD_LENGTH))
  );
}
