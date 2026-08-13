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
  return fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => parseOrThrow<AttemptResponse>(res));
}

export function fetchExercises(): Promise<Exercise[]> {
  return fetch("/api/exercises").then((res) => parseOrThrow<Exercise[]>(res));
}
