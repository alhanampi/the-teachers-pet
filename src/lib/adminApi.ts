import type { Difficulty, Exercise, Level } from "../types/exercise";
import type { AttemptRecord, Student } from "../types/admin";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      } | null;
    };
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function authorizedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await window.Clerk?.session?.getToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  return fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });
}

export function fetchStudents(): Promise<Student[]> {
  return authorizedFetch("/api/students").then((res) => parseOrThrow<Student[]>(res));
}

export function fetchStudentAttempts(studentId: string): Promise<AttemptRecord[]> {
  return authorizedFetch(`/api/student-attempts?studentId=${encodeURIComponent(studentId)}`).then(
    (res) => parseOrThrow<AttemptRecord[]>(res),
  );
}

export interface NewExercisePayload {
  level: Level;
  difficulty: Difficulty;
  type: Exercise["type"];
  prompt: string;
  hint?: string;
  options?: string[];
  answer?: string;
  pairs?: { left: string; right: string }[];
  words?: string[];
  items?: string[];
}

export function createExercise(payload: NewExercisePayload): Promise<Exercise> {
  return authorizedFetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseOrThrow<Exercise>(res));
}

export function updateExercise(id: string, payload: NewExercisePayload): Promise<Exercise> {
  return authorizedFetch(`/api/exercises?id=${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseOrThrow<Exercise>(res));
}

export function deleteExercise(id: string): Promise<{ id: string }> {
  return authorizedFetch(`/api/exercises?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then((res) => parseOrThrow<{ id: string }>(res));
}
