import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireTeacher } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";

interface StudentRow {
  id: string;
  name: string;
  points: number;
  created_at: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const teacher = await requireTeacher(req);
  if (!teacher) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await ensureSchema();

    const rows = (await sql`
      SELECT id, name, points, created_at FROM students ORDER BY name
    `) as StudentRow[];

    res.status(200).json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        points: row.points,
        createdAt: row.created_at,
      })),
    );
  } catch (error) {
    console.error("GET /api/students failed", error);
    res.status(500).json({ error: "Could not load students" });
  }
}
