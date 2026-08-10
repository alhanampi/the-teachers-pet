import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(connectionString);

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          points integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS attempts (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id uuid NOT NULL REFERENCES students(id),
          exercise_id text NOT NULL,
          level text NOT NULL,
          difficulty text NOT NULL,
          points integer NOT NULL DEFAULT 1,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return schemaReady;
}
