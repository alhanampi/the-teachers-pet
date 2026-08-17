import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireStudent } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";
import { isValidUuid } from "./_validate.js";

interface StudentRow {
  teacher_id: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { teacherId } = req.body as { teacherId?: string };
  if (!isValidUuid(teacherId)) {
    res.status(400).json({ error: "teacherId is required" });
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
      UPDATE students SET teacher_id = ${teacherId}
      WHERE clerk_user_id = ${student.id}
      RETURNING teacher_id
    `) as StudentRow[];

    if (rows.length === 0) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.status(200).json({ teacherId: rows[0].teacher_id });
  } catch (error) {
    console.error("POST /api/student-onboarding failed", error);
    res.status(500).json({ error: "Could not save the teacher selection" });
  }
}
