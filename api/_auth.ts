import type { VercelRequest } from "@vercel/node";
import { verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  throw new Error("CLERK_SECRET_KEY is not set");
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
    // authorizedParties intentionally omitted: it would require keeping every deployed
    // domain (production + every preview URL) registered up front, the same trap that broke
    // Neon Auth logins on freshly deployed URLs previously.
    const payload = (await verifyToken(token, { secretKey })) as Record<string, unknown>;
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!email || !id) return null;
    return { id, email };
  } catch {
    return null;
  }
}
