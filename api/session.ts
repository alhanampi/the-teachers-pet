import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, sql } from "./_db";
import { isValidUuid, MAX_NAME_LENGTH } from "./_validate";

interface StudentRow {
  id: string;
  name: string;
  points: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, studentId } = req.body as { name?: string; studentId?: string };
  const trimmedName = name?.trim();
  if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH || !isValidUuid(studentId)) {
    res.status(400).json({ error: "name and studentId are required" });
    return;
  }

  try {
    await ensureSchema();

    const rows = (await sql`
      INSERT INTO students (id, name)
      VALUES (${studentId}, ${trimmedName})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, points
    `) as StudentRow[];

    const student = rows[0];
    res.status(200).json({ studentId: student.id, name: student.name, points: student.points });
  } catch (error) {
    console.error("POST /api/session failed", error);
    res.status(500).json({ error: "Could not save the session" });
  }
}
