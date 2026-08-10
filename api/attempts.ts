import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, sql } from "./_db";
import { isValidDifficulty, isValidLevel, isValidUuid, MAX_EXERCISE_ID_LENGTH } from "./_validate";

interface PointsRow {
  points: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { studentId, exerciseId, level, difficulty } = req.body as {
    studentId?: string;
    exerciseId?: string;
    level?: string;
    difficulty?: string;
  };

  if (
    !isValidUuid(studentId) ||
    typeof exerciseId !== "string" ||
    !exerciseId ||
    exerciseId.length > MAX_EXERCISE_ID_LENGTH ||
    !isValidLevel(level) ||
    !isValidDifficulty(difficulty)
  ) {
    res.status(400).json({ error: "studentId, exerciseId, level and difficulty are required" });
    return;
  }

  try {
    await ensureSchema();

    await sql`
      INSERT INTO attempts (student_id, exercise_id, level, difficulty)
      VALUES (${studentId}, ${exerciseId}, ${level}, ${difficulty})
    `;

    const rows = (await sql`
      UPDATE students SET points = points + 1 WHERE id = ${studentId}
      RETURNING points
    `) as PointsRow[];

    if (rows.length === 0) {
      res.status(404).json({ error: "student not found" });
      return;
    }

    res.status(200).json({ points: rows[0].points });
  } catch (error) {
    console.error("POST /api/attempts failed", error);
    res.status(500).json({ error: "Could not save the attempt" });
  }
}
