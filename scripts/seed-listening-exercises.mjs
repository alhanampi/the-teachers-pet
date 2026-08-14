// One-off seed script: creates the 18 "listening" exercises (3 per CEFR level, one per
// difficulty) via the real POST /api/exercises contract — never touches Neon directly.
//
// Usage:
//   1. Log into /admin/exercises in the browser (vercel dev or your deployed URL).
//   2. Open devtools > Network, find a request to /api/students or /api/student-attempts,
//      copy the "Authorization: Bearer <token>" header value (it expires in ~15 minutes).
//   3. Run:
//        TEACHER_TOKEN=<token> BASE_URL=http://localhost:3000 node scripts/seed-listening-exercises.mjs
//      (BASE_URL defaults to http://localhost:3000 if omitted)

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TOKEN = process.env.TEACHER_TOKEN;

if (!TOKEN) {
  console.error("Missing TEACHER_TOKEN env var. See the comment at the top of this script.");
  process.exit(1);
}

const EXERCISES = [
  {
    level: "A1",
    difficulty: "easy",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["cat", "dog", "bird", "fish"],
  },
  {
    level: "A1",
    difficulty: "medium",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["red", "blue", "green", "yellow"],
  },
  {
    level: "A1",
    difficulty: "hard",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["three", "seven", "nine", "twelve"],
  },
  {
    level: "A2",
    difficulty: "easy",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["apple", "bread", "milk", "rice"],
  },
  {
    level: "A2",
    difficulty: "medium",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["mother", "father", "sister", "brother"],
  },
  {
    level: "A2",
    difficulty: "hard",
    prompt: "🎧 Listen and match each word you hear.",
    items: ["sunny", "rainy", "cloudy", "windy"],
  },
  {
    level: "B1",
    difficulty: "easy",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: ["Good morning", "Good night", "See you later", "Nice to meet you"],
  },
  {
    level: "B1",
    difficulty: "medium",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: ["I wake up early", "I go to school", "I eat breakfast", "I do my homework"],
  },
  {
    level: "B1",
    difficulty: "hard",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: ["I am happy today", "I am a bit tired", "I feel nervous", "I am so excited"],
  },
  {
    level: "B2",
    difficulty: "easy",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: ["Let's meet at six", "Can you help me?", "I'll call you later", "What time is it?"],
  },
  {
    level: "B2",
    difficulty: "medium",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "I think it's a good idea",
      "I'm not sure about that",
      "That sounds great",
      "I disagree with you",
    ],
  },
  {
    level: "B2",
    difficulty: "hard",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "The flight was delayed",
      "I forgot my passport",
      "We missed the train",
      "Our hotel was lovely",
    ],
  },
  {
    level: "C1",
    difficulty: "easy",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "It's raining cats and dogs",
      "Break a leg",
      "It's a piece of cake",
      "It costs an arm and a leg",
    ],
  },
  {
    level: "C1",
    difficulty: "medium",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "I have a tight deadline",
      "We need to reschedule the meeting",
      "She got a promotion",
      "The project is behind schedule",
    ],
  },
  {
    level: "C1",
    difficulty: "hard",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "I see your point, but...",
      "That's a fair assumption",
      "On the other hand...",
      "It depends on the context",
    ],
  },
  {
    level: "C2",
    difficulty: "easy",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "I would like to raise a concern",
      "Allow me to elaborate",
      "With all due respect",
      "That remains to be seen",
    ],
  },
  {
    level: "C2",
    difficulty: "medium",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "It's a double-edged sword",
      "The situation is far more nuanced",
      "I stand corrected",
      "That's beside the point",
    ],
  },
  {
    level: "C2",
    difficulty: "hard",
    prompt: "🎧 Listen and match each phrase you hear.",
    items: [
      "The implications are far-reaching",
      "It's a matter of perspective",
      "The evidence is inconclusive",
      "That's an oversimplification",
    ],
  },
];

async function main() {
  const existingRes = await fetch(`${BASE_URL}/api/exercises`);
  if (!existingRes.ok) {
    throw new Error(`GET /api/exercises failed: ${existingRes.status}`);
  }
  const existing = await existingRes.json();

  for (const exercise of EXERCISES) {
    const alreadyThere = existing.some(
      (row) =>
        row.type === "listening" &&
        row.level === exercise.level &&
        row.difficulty === exercise.difficulty &&
        row.prompt === exercise.prompt,
    );
    if (alreadyThere) {
      console.log(`SKIP  ${exercise.level}/${exercise.difficulty} (already exists)`);
      continue;
    }

    const res = await fetch(`${BASE_URL}/api/exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        level: exercise.level,
        difficulty: exercise.difficulty,
        type: "listening",
        prompt: exercise.prompt,
        items: exercise.items,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`FAIL  ${exercise.level}/${exercise.difficulty}: ${res.status} ${body}`);
      continue;
    }

    const saved = await res.json();
    const audioCounts = saved.items.filter((item) => item.audioUrl).length;
    console.log(
      `OK    ${exercise.level}/${exercise.difficulty} — ${audioCounts}/${saved.items.length} items got dictionary audio`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
