import { describe, expect, it } from "vitest";
import { shuffleArray } from "./shuffle";

describe("shuffleArray", () => {
  it("returns the same elements as the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array instance", () => {
    const input = [1, 2, 3];
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
  });

  it("handles an empty array", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("handles a single-element array", () => {
    expect(shuffleArray(["only"])).toEqual(["only"]);
  });
});
