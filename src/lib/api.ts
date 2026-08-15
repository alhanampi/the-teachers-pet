import type { Difficulty, Exercise, Level } from "../types/exercise";

export interface SessionResponse {
  studentId: string;
  name: string;
  points: number;
}

export interface AttemptResponse {
  points: number;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

const RETRY_DELAYS_MS = [300, 900];

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export function startSession(name: string, studentId: string): Promise<SessionResponse> {
  return fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, studentId }),
  }).then((res) => parseOrThrow<SessionResponse>(res));
}

export function recordAttempt(params: {
  studentId: string;
  exerciseId: string;
  level: Level;
  difficulty: Difficulty;
  correct: boolean;
}): Promise<AttemptResponse> {
  return withRetry(() =>
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }).then((res) => parseOrThrow<AttemptResponse>(res)),
  );
}

export function fetchExercises(): Promise<Exercise[]> {
  return fetch("/api/exercises").then((res) => parseOrThrow<Exercise[]>(res));
}
