import type { Institute, Teacher } from "../types/institute";
import type { AttemptRecord } from "../types/admin";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      } | null;
    };
  }
}

export interface SessionResponse {
  studentId: string;
  name: string;
  points: number;
  teacherId: string | null;
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

export function startSession(): Promise<SessionResponse> {
  return authorizedFetch("/api/session", { method: "POST" }).then((res) =>
    parseOrThrow<SessionResponse>(res),
  );
}

export function fetchInstitutes(): Promise<Institute[]> {
  return authorizedFetch("/api/institutes").then((res) => parseOrThrow<Institute[]>(res));
}

export function fetchTeachers(instituteId: string): Promise<Teacher[]> {
  return authorizedFetch(`/api/teachers?instituteId=${encodeURIComponent(instituteId)}`).then(
    (res) => parseOrThrow<Teacher[]>(res),
  );
}

export function chooseTeacher(teacherId: string): Promise<{ teacherId: string | null }> {
  return authorizedFetch("/api/student-onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId }),
  }).then((res) => parseOrThrow<{ teacherId: string | null }>(res));
}

export function fetchMyAttempts(): Promise<AttemptRecord[]> {
  return authorizedFetch("/api/my-attempts").then((res) => parseOrThrow<AttemptRecord[]>(res));
}
