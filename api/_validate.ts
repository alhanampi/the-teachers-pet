export const MAX_NAME_LENGTH = 40;
export const MAX_EXERCISE_ID_LENGTH = 100;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

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
