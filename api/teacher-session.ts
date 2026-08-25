import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireTeacher } from "./_auth.js";

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

  res.status(200).json({ teacherId: teacher.teacherId, email: teacher.email });
}
