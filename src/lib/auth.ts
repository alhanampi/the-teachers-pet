import { createAuthClient } from "@neondatabase/neon-js/auth";

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL;

export const authClient = createAuthClient(NEON_AUTH_URL);

export async function getTeacherToken(): Promise<string | null> {
  const res = await fetch(`${NEON_AUTH_URL}/token`, { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string };
  return data.token;
}
