// One-off seed for the dedicated Neon "development" branch (see CLAUDE.md — Vercel's
// Development/Preview environments point here, Production stays on the real "main" branch).
// Creates a "Dev Testing" institute and links a teacher's Clerk account to it, so local/preview
// testing never has to touch real students. Mirrors
// scripts/link-legacy-students-to-miss-nati.mjs's shape (idempotent, ON CONFLICT DO UPDATE),
// but also creates the institutes/teachers tables first since a fresh branch starts empty —
// api/_db.ts's ensureSchema() isn't reachable from a plain script without a TS loader, so the
// two CREATE TABLE statements below are duplicated from there. They're safe to run again even
// after the full schema exists (IF NOT EXISTS), and the rest of the schema still gets created
// normally the first time any /api endpoint runs against this branch.
//
// Usage:
//   DATABASE_URL=<development branch connection string> node scripts/seed-dev-teacher.mjs
//   (or just run it with .env.local already pointed at the dev branch, e.g. via `vercel dev`'s
//   own env loading — see below for how this repo loads .env.local for plain node scripts)

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(__dirname, "../.env.local");
  const envContent = readFileSync(envPath, "utf8");
  const match = envContent.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error(`DATABASE_URL not found in ${envPath}`);
  return match[1].trim().replace(/^"|"$/g, "");
}

const DEV_TEACHER_CLERK_USER_ID = "user_3HxxnFVR181DfRuQuwzfMGMvPwx"; // alhanampi@gmail.com
const DEV_TEACHER_NAME = "Pamina (dev)";
const DEV_INSTITUTE_NAME = "Dev Testing";

const sql = neon(loadDatabaseUrl());

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS institutes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS teachers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id text NOT NULL UNIQUE,
      display_name text NOT NULL,
      institute_id uuid NOT NULL REFERENCES institutes(id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const [institute] = await sql`
    INSERT INTO institutes (name) VALUES (${DEV_INSTITUTE_NAME})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  console.log(`Institute "${DEV_INSTITUTE_NAME}": ${institute.id}`);

  const [teacher] = await sql`
    INSERT INTO teachers (clerk_user_id, display_name, institute_id)
    VALUES (${DEV_TEACHER_CLERK_USER_ID}, ${DEV_TEACHER_NAME}, ${institute.id})
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      institute_id = EXCLUDED.institute_id
    RETURNING id
  `;
  console.log(`Teacher "${DEV_TEACHER_NAME}": ${teacher.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
