// One-off migration: existing "students" rows created before student accounts existed have
// no clerk_user_id/teacher_id. Links all of them to Miss Nati / International Word, the only
// teacher/institute that exists at the time of this migration — never touches Neon by hand.
//
// Usage:
//   1. Deploy the schema change in api/_db.ts first (institutes/teachers tables + the new
//      students columns) and let ensureSchema() run at least once.
//   2. Look up Miss Nati's Clerk user id by hand in the TEACHER Clerk application's dashboard
//      (Users -> search natisaccone@gmail.com -> copy the user_xxx id) — not inferable from code.
//   3. Run:
//        MISS_NATI_CLERK_USER_ID=user_xxx DATABASE_URL=... node scripts/link-legacy-students-to-miss-nati.mjs
//      (idempotent — safe to re-run)

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const CLERK_USER_ID = process.env.MISS_NATI_CLERK_USER_ID;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL env var.");
  process.exit(1);
}

if (!CLERK_USER_ID) {
  console.error(
    "Missing MISS_NATI_CLERK_USER_ID env var. See the comment at the top of this script.",
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  const [institute] = await sql`
    INSERT INTO institutes (name) VALUES ('International Word')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  console.log(`Institute "International Word": ${institute.id}`);

  const [teacher] = await sql`
    INSERT INTO teachers (clerk_user_id, display_name, institute_id)
    VALUES (${CLERK_USER_ID}, 'Miss Nati', ${institute.id})
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      institute_id = EXCLUDED.institute_id
    RETURNING id
  `;
  console.log(`Teacher "Miss Nati": ${teacher.id}`);

  const linked = await sql`
    UPDATE students SET teacher_id = ${teacher.id}
    WHERE teacher_id IS NULL
    RETURNING id
  `;
  console.log(`Linked ${linked.length} legacy student(s) to Miss Nati / International Word.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
