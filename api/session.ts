import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireStudent } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";
import { MAX_NAME_LENGTH } from "./_validate.js";

interface StudentRow {
  id: string;
  name: string;
  points: number;
  teacher_id: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const student = await requireStudent(req);
  if (!student) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Clerk enforces its own username rules; this just keeps "bounded lengths on the server
  // too" honest even though the value isn't attacker-controlled request-body input anymore.
  const name = student.username.slice(0, MAX_NAME_LENGTH);

  try {
    await ensureSchema();

    const rows = (await sql`
      INSERT INTO students (clerk_user_id, name)
      VALUES (${student.id}, ${name})
      ON CONFLICT (clerk_user_id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, points, teacher_id
    `) as StudentRow[];

    const row = rows[0];
    res
      .status(200)
      .json({ studentId: row.id, name: row.name, points: row.points, teacherId: row.teacher_id });
  } catch (error) {
    console.error("POST /api/session failed", error);
    res.status(500).json({ error: "Could not save the session" });
  }
}
