import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireTeacher } from "./_auth.js";
import { ensureSchema, sql } from "./_db.js";
import {
  isNonEmptyString,
  isValidDifficulty,
  isValidExerciseType,
  isValidLevel,
  isValidListeningItems,
  isValidOptions,
  isValidPairs,
  isValidUuid,
  isValidWords,
  MAX_ANSWER_LENGTH,
  MAX_HINT_LENGTH,
  MAX_PROMPT_LENGTH,
} from "./_validate.js";

interface ListeningItemRow {
  text: string;
  audioUrl: string | null;
}

interface ExerciseRow {
  id: string;
  level: string;
  difficulty: string;
  type: string;
  prompt: string;
  hint: string | null;
  options: string[] | null;
  answer: string | null;
  pairs: { left: string; right: string }[] | null;
  words: string[] | null;
  items: ListeningItemRow[] | null;
}

interface ExerciseBody {
  level?: string;
  difficulty?: string;
  type?: string;
  prompt?: string;
  hint?: string;
  options?: unknown;
  answer?: unknown;
  pairs?: unknown;
  words?: unknown;
  items?: unknown;
}

interface ExerciseFields {
  hint: string | null;
  options: string[] | null;
  answer: string | null;
  pairs: { left: string; right: string }[] | null;
  words: string[] | null;
  items: ListeningItemRow[] | null;
}

const DICTIONARY_LOOKUP_TIMEOUT_MS = 3000;
const SINGLE_WORD_RE = /^[a-z'-]+$/i;

interface DictionaryPhonetic {
  audio?: string;
}

interface DictionaryEntry {
  phonetics?: DictionaryPhonetic[];
}

async function lookupDictionaryAudio(text: string): Promise<string | null> {
  const word = text.trim();
  if (!SINGLE_WORD_RE.test(word)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DICTIONARY_LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
      { signal: controller.signal },
    );
    if (!response.ok) return null;
    const entries = (await response.json()) as DictionaryEntry[];
    for (const entry of entries) {
      const audio = entry.phonetics?.find((phonetic) => phonetic.audio)?.audio;
      if (audio) return audio;
    }
    return null;
  } catch (error) {
    console.error(`Dictionary lookup failed for "${word}"`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isValidTopLevelFields(body: ExerciseBody): boolean {
  return (
    isValidLevel(body.level) &&
    isValidDifficulty(body.difficulty) &&
    isValidExerciseType(body.type) &&
    isNonEmptyString(body.prompt, MAX_PROMPT_LENGTH) &&
    (body.hint === undefined || isNonEmptyString(body.hint, MAX_HINT_LENGTH))
  );
}

async function buildExerciseFields(
  body: ExerciseBody,
): Promise<ExerciseFields | { error: string }> {
  const hint = body.hint ?? null;

  if (body.type === "multiple-choice") {
    if (
      !isValidOptions(body.options) ||
      !isNonEmptyString(body.answer, MAX_ANSWER_LENGTH) ||
      !body.options.includes(body.answer)
    ) {
      return { error: "Invalid multiple-choice fields" };
    }
    return {
      hint,
      options: body.options,
      answer: body.answer,
      pairs: null,
      words: null,
      items: null,
    };
  }

  if (body.type === "fill-blank") {
    if (!isNonEmptyString(body.answer, MAX_ANSWER_LENGTH)) {
      return { error: "Invalid fill-blank fields" };
    }
    return { hint, options: null, answer: body.answer, pairs: null, words: null, items: null };
  }

  if (body.type === "matching") {
    if (!isValidPairs(body.pairs)) {
      return { error: "Invalid matching fields" };
    }
    return { hint, options: null, answer: null, pairs: body.pairs, words: null, items: null };
  }

  if (body.type === "listening") {
    if (!isValidListeningItems(body.items)) {
      return { error: "Invalid listening fields" };
    }
    const items = await Promise.all(
      body.items.map(async (text) => ({ text, audioUrl: await lookupDictionaryAudio(text) })),
    );
    return { hint, options: null, answer: null, pairs: null, words: null, items };
  }

  // word-order
  if (!isValidWords(body.words)) {
    return { error: "Invalid word-order fields" };
  }
  const answer = body.words.join(" ");
  if (answer.length > MAX_ANSWER_LENGTH) {
    return { error: "Invalid word-order fields" };
  }
  return { hint, options: null, answer, pairs: null, words: body.words, items: null };
}

async function handleGet(res: VercelResponse) {
  await ensureSchema();
  const rows = (await sql`
    SELECT id, level, difficulty, type, prompt, hint, options, answer, pairs, words, items
    FROM exercises
    ORDER BY level, difficulty, type
  `) as ExerciseRow[];

  res.status(200).json(rows);
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const teacher = await requireTeacher(req);
  if (!teacher) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as ExerciseBody;

  if (!isValidTopLevelFields(body)) {
    res.status(400).json({ error: "Invalid exercise fields" });
    return;
  }

  const fields = await buildExerciseFields(body);
  if ("error" in fields) {
    res.status(400).json({ error: fields.error });
    return;
  }

  await ensureSchema();

  const rows = (await sql`
    INSERT INTO exercises (level, difficulty, type, prompt, hint, options, answer, pairs, words, items)
    VALUES (
      ${body.level},
      ${body.difficulty},
      ${body.type},
      ${body.prompt},
      ${fields.hint},
      ${fields.options ? JSON.stringify(fields.options) : null},
      ${fields.answer},
      ${fields.pairs ? JSON.stringify(fields.pairs) : null},
      ${fields.words ? JSON.stringify(fields.words) : null},
      ${fields.items ? JSON.stringify(fields.items) : null}
    )
    RETURNING id, level, difficulty, type, prompt, hint, options, answer, pairs, words, items
  `) as ExerciseRow[];

  res.status(201).json(rows[0]);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };
  if (!isValidUuid(id)) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  const teacher = await requireTeacher(req);
  if (!teacher) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as ExerciseBody;

  if (!isValidTopLevelFields(body)) {
    res.status(400).json({ error: "Invalid exercise fields" });
    return;
  }

  const fields = await buildExerciseFields(body);
  if ("error" in fields) {
    res.status(400).json({ error: fields.error });
    return;
  }

  await ensureSchema();

  const rows = (await sql`
    UPDATE exercises
    SET
      level = ${body.level},
      difficulty = ${body.difficulty},
      type = ${body.type},
      prompt = ${body.prompt},
      hint = ${fields.hint},
      options = ${fields.options ? JSON.stringify(fields.options) : null},
      answer = ${fields.answer},
      pairs = ${fields.pairs ? JSON.stringify(fields.pairs) : null},
      words = ${fields.words ? JSON.stringify(fields.words) : null},
      items = ${fields.items ? JSON.stringify(fields.items) : null}
    WHERE id = ${id}
    RETURNING id, level, difficulty, type, prompt, hint, options, answer, pairs, words, items
  `) as ExerciseRow[];

  if (rows.length === 0) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }

  res.status(200).json(rows[0]);
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };
  if (!isValidUuid(id)) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  const teacher = await requireTeacher(req);
  if (!teacher) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await ensureSchema();

  const rows = (await sql`
    DELETE FROM exercises WHERE id = ${id} RETURNING id
  `) as { id: string }[];

  if (rows.length === 0) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }

  res.status(200).json({ id: rows[0].id });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      await handleGet(res);
      return;
    }
    if (req.method === "POST") {
      await handlePost(req, res);
      return;
    }
    if (req.method === "PUT") {
      await handlePut(req, res);
      return;
    }
    if (req.method === "DELETE") {
      await handleDelete(req, res);
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(`${req.method} /api/exercises failed`, error);
    res.status(500).json({ error: "Could not process the exercise request" });
  }
}
