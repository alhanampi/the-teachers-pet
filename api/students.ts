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
  if (!teacher.teacherId) {
    res.status(403).json({ error: "This account isn't linked to a teacher profile" });
    return;
  }

  // Se junta acá (en vez de tener su propio api/teacher-session.ts) solo para no superar el
  // límite de 12 Serverless Functions por deploy del plan Hobby — la verificación de auth+
  // vínculo es la misma, `RequireAuth` solo necesita la identidad, sin la query de la lista.
  if (req.query.whoami === "1") {
    res.status(200).json({ teacherId: teacher.teacherId, email: teacher.email });
    return;
  }

  try {
    await ensureSchema();

    const rows = (await sql`
      SELECT id, name, points, created_at FROM students
      WHERE teacher_id = ${teacher.teacherId}
      ORDER BY name
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
