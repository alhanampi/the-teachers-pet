import type { VercelRequest } from "@vercel/node";
import { verifyToken } from "@clerk/backend";
import { ensureSchema, sql } from "./_db.js";

const secretKey = process.env.CLERK_SECRET_KEY;
const studentSecretKey = process.env.CLERK_STUDENT_SECRET_KEY;

if (!secretKey) {
  throw new Error("CLERK_SECRET_KEY is not set");
}

if (!studentSecretKey) {
  throw new Error("CLERK_STUDENT_SECRET_KEY is not set");
}

export interface Teacher {
  id: string;
  email: string;
  // Resolved from the `teachers` table (separate from Clerk's own id) — null for a teacher
  // who's signed up in Clerk but has no `teachers` row yet (e.g. before the seed script runs).
  teacherId: string | null;
}

export interface Student {
  id: string;
  username: string;
}

export async function requireTeacher(req: VercelRequest): Promise<Teacher | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);

  try {
    // authorizedParties intentionally omitted: it would require keeping every deployed
    // domain (production + every preview URL) registered up front, the same trap that broke
    // Neon Auth logins on freshly deployed URLs previously.
    const payload = (await verifyToken(token, { secretKey })) as Record<string, unknown>;
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!email || !id) return null;

    await ensureSchema();
    const rows = (await sql`SELECT id FROM teachers WHERE clerk_user_id = ${id}`) as {
      id: string;
    }[];
    return { id, email, teacherId: rows[0]?.id ?? null };
  } catch {
    return null;
  }
}

export async function requireStudent(req: VercelRequest): Promise<Student | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);

  try {
    // Verified against the student Clerk application's own secret key — a token issued by
    // the teacher application fails signature verification outright, so the two auth
    // domains are cryptographically isolated for free, no extra cross-app check needed.
    const payload = (await verifyToken(token, { secretKey: studentSecretKey })) as Record<
      string,
      unknown
    >;
    const username = typeof payload.username === "string" ? payload.username : null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!username || !id) return null;
    return { id, username };
  } catch {
    return null;
  }
}
