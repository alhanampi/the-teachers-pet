import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireStudent } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";
import { isValidUuid } from "./_validate.js";

interface TeacherRow {
  id: string;
  display_name: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { instituteId } = req.query as { instituteId?: string };
  if (!isValidUuid(instituteId)) {
    res.status(400).json({ error: "instituteId is required" });
    return;
  }

  const student = await requireStudent(req);
  if (!student) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await ensureSchema();

    const rows = (await sql`
      SELECT id, display_name FROM teachers
      WHERE institute_id = ${instituteId}
      ORDER BY display_name
    `) as TeacherRow[];

    res.status(200).json(rows.map((row) => ({ id: row.id, displayName: row.display_name })));
  } catch (error) {
    console.error("GET /api/teachers failed", error);
    res.status(500).json({ error: "Could not load teachers" });
  }
}
