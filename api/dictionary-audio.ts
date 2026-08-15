import type { VercelRequest, VercelResponse } from "@vercel/node";
import { lookupDictionaryAudio } from "./_dictionary.js";
import { MAX_LISTENING_ITEM_LENGTH, isNonEmptyString } from "./_validate.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { word } = req.query as { word?: string };
    if (!isNonEmptyString(word, MAX_LISTENING_ITEM_LENGTH)) {
      res.status(400).json({ error: "word is required" });
      return;
    }

    const audioUrl = await lookupDictionaryAudio(word);
    res.status(200).json({ audioUrl });
  } catch (error) {
    console.error("GET /api/dictionary-audio failed", error);
    res.status(500).json({ error: "Could not look up pronunciation audio" });
  }
}
