import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireTeacher } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";
import { isValidUuid } from "./_validate.js";

interface AttemptRow {
  id: string;
  exercise_id: string;
  level: string;
  difficulty: string;
  correct: boolean;
  created_at: string;
  prompt: string | null;
  type: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { studentId } = req.query as { studentId?: string };

  if (!isValidUuid(studentId)) {
    res.status(400).json({ error: "studentId is required" });
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

  try {
    await ensureSchema();

    const [owned] = (await sql`
      SELECT 1 FROM students WHERE id = ${studentId} AND teacher_id = ${teacher.teacherId}
    `) as unknown[];
    if (!owned) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const rows = (await sql`
      SELECT
        a.id,
        a.exercise_id,
        a.level,
        a.difficulty,
        a.correct,
        a.created_at,
        e.prompt,
        e.type
      FROM attempts a
      LEFT JOIN exercises e ON e.id::text = a.exercise_id
      WHERE a.student_id = ${studentId}
      ORDER BY a.created_at DESC
    `) as AttemptRow[];

    res.status(200).json(
      rows.map((row) => ({
        id: row.id,
        exerciseId: row.exercise_id,
        level: row.level,
        difficulty: row.difficulty,
        correct: row.correct,
        createdAt: row.created_at,
        prompt: row.prompt,
        type: row.type,
      })),
    );
  } catch (error) {
    console.error("GET /api/student-attempts failed", error);
    res.status(500).json({ error: "Could not load the student's attempts" });
  }
}
