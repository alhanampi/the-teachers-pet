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
      await sql`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE
      `;
      await sql`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id)
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
      await sql`
        ALTER TABLE attempts ADD COLUMN IF NOT EXISTS correct boolean NOT NULL DEFAULT true
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS exercises (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          level text NOT NULL,
          difficulty text NOT NULL,
          type text NOT NULL,
          prompt text NOT NULL,
          hint text,
          options jsonb,
          answer text,
          pairs jsonb,
          words jsonb,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        ALTER TABLE exercises ADD COLUMN IF NOT EXISTS items jsonb
      `;
    })();
  }
  return schemaReady;
}
