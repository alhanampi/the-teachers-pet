import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireStudent } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";

interface InstituteRow {
  id: string;
  name: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
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
      SELECT id, name FROM institutes ORDER BY name
    `) as InstituteRow[];

    res.status(200).json(rows.map((row) => ({ id: row.id, name: row.name })));
  } catch (error) {
    console.error("GET /api/institutes failed", error);
    res.status(500).json({ error: "Could not load institutes" });
  }
}
