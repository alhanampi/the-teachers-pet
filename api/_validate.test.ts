import { describe, expect, it } from "vitest";
import {
  isNonEmptyString,
  isValidBoolean,
  isValidDifficulty,
  isValidExerciseType,
  isValidLevel,
  isValidListeningItems,
  isValidOptions,
  isValidPairs,
  isValidUuid,
  isValidWords,
  LISTENING_ITEMS_COUNT,
  MAX_OPTIONS,
  MAX_PAIRS,
  MAX_WORDS,
} from "./_validate";

describe("isValidUuid", () => {
  it("accepts a well-formed uuid", () => {
    expect(isValidUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  it("rejects malformed strings and non-strings", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("")).toBe(false);
    expect(isValidUuid(123)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
  });
});

describe("isValidLevel / isValidDifficulty / isValidExerciseType", () => {
  it("accepts every valid enum value", () => {
    for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(isValidLevel(level)).toBe(true);
    }
    for (const difficulty of ["easy", "medium", "hard"]) {
      expect(isValidDifficulty(difficulty)).toBe(true);
    }
    for (const type of ["multiple-choice", "fill-blank", "matching", "word-order", "listening"]) {
      expect(isValidExerciseType(type)).toBe(true);
    }
  });

  it("rejects unknown values and wrong casing", () => {
    expect(isValidLevel("a1")).toBe(false);
    expect(isValidLevel("D1")).toBe(false);
    expect(isValidDifficulty("Easy")).toBe(false);
    expect(isValidExerciseType("essay")).toBe(false);
    expect(isValidLevel(1)).toBe(false);
  });
});

describe("isValidBoolean", () => {
  it("only accepts real booleans", () => {
    expect(isValidBoolean(true)).toBe(true);
    expect(isValidBoolean(false)).toBe(true);
    expect(isValidBoolean("true")).toBe(false);
    expect(isValidBoolean(1)).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("accepts a non-empty string within the length limit", () => {
    expect(isNonEmptyString("hello", 10)).toBe(true);
  });

  it("accepts a string exactly at the length limit", () => {
    expect(isNonEmptyString("12345", 5)).toBe(true);
  });

  it("rejects a string one character over the limit", () => {
    expect(isNonEmptyString("123456", 5)).toBe(false);
  });

  it("rejects empty or whitespace-only strings", () => {
    expect(isNonEmptyString("", 10)).toBe(false);
    expect(isNonEmptyString("   ", 10)).toBe(false);
  });
});

describe("isValidOptions", () => {
  it("accepts between 2 and MAX_OPTIONS valid options", () => {
    expect(isValidOptions(["a", "b"])).toBe(true);
    expect(isValidOptions(Array.from({ length: MAX_OPTIONS }, (_, i) => `option-${i}`))).toBe(true);
  });

  it("rejects too few or too many options", () => {
    expect(isValidOptions(["only-one"])).toBe(false);
    expect(isValidOptions(Array.from({ length: MAX_OPTIONS + 1 }, (_, i) => `option-${i}`))).toBe(
      false,
    );
  });

  it("rejects a non-array or an option that is empty", () => {
    expect(isValidOptions("a,b")).toBe(false);
    expect(isValidOptions(["a", ""])).toBe(false);
  });
});

describe("isValidPairs", () => {
  it("accepts between 3 and MAX_PAIRS well-formed pairs", () => {
    const pairs = [
      { left: "cat", right: "gato" },
      { left: "dog", right: "perro" },
      { left: "bird", right: "pájaro" },
    ];
    expect(isValidPairs(pairs)).toBe(true);
    expect(
      isValidPairs(
        Array.from({ length: MAX_PAIRS }, (_, i) => ({ left: `l${i}`, right: `r${i}` })),
      ),
    ).toBe(true);
  });

  it("rejects too few pairs or a malformed pair", () => {
    expect(isValidPairs([{ left: "cat", right: "gato" }])).toBe(false);
    expect(isValidPairs([{ left: "cat" }, { left: "dog", right: "perro" }])).toBe(false);
  });
});

describe("isValidWords", () => {
  it("accepts between 2 and MAX_WORDS words", () => {
    expect(isValidWords(["The", "cat"])).toBe(true);
    expect(isValidWords(Array.from({ length: MAX_WORDS }, (_, i) => `word${i}`))).toBe(true);
  });

  it("rejects too few or too many words", () => {
    expect(isValidWords(["only"])).toBe(false);
    expect(isValidWords(Array.from({ length: MAX_WORDS + 1 }, (_, i) => `word${i}`))).toBe(false);
  });
});

describe("isValidListeningItems", () => {
  it(`accepts exactly ${LISTENING_ITEMS_COUNT} unique items`, () => {
    expect(isValidListeningItems(["cat", "dog", "bird", "fish"])).toBe(true);
  });

  it("rejects the wrong count", () => {
    expect(isValidListeningItems(["cat", "dog", "bird"])).toBe(false);
    expect(isValidListeningItems(["cat", "dog", "bird", "fish", "cow"])).toBe(false);
  });

  it("rejects case-insensitive duplicates", () => {
    expect(isValidListeningItems(["cat", "Cat", "bird", "fish"])).toBe(false);
  });
});
