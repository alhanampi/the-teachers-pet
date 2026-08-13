import type { VercelRequest } from "@vercel/node";
import { createRemoteJWKSet, jwtVerify } from "jose";

const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

if (!authBaseUrl) {
  throw new Error("NEON_AUTH_BASE_URL is not set");
}

const jwks = createRemoteJWKSet(new URL(`${authBaseUrl}/.well-known/jwks.json`));
const issuer = new URL(authBaseUrl).origin;

function allowedTeacherEmails(): string[] {
  return (process.env.ALLOWED_TEACHER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export interface Teacher {
  id: string;
  email: string;
}

export async function requireTeacher(req: VercelRequest): Promise<Teacher | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!email || !id) return null;
    if (!allowedTeacherEmails().includes(email)) return null;
    return { id, email };
  } catch {
    return null;
  }
}
