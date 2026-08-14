import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, sql } from "./_db.js";
import { isValidUuid } from "./_validate.js";

interface ProgressRow {
  name: string;
  points: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { studentId } = req.query;
  if (!isValidUuid(studentId)) {
    res.status(400).json({ error: "studentId is required" });
    return;
  }

  try {
    await ensureSchema();

    const rows = (await sql`
      SELECT name, points FROM students WHERE id = ${studentId}
    `) as ProgressRow[];

    if (rows.length === 0) {
      res.status(404).json({ error: "student not found" });
      return;
    }

    res.status(200).json({ name: rows[0].name, points: rows[0].points });
  } catch (error) {
    console.error("GET /api/progress failed", error);
    res.status(500).json({ error: "Could not load progress" });
  }
}
