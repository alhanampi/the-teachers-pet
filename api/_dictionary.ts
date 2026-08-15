const DICTIONARY_LOOKUP_TIMEOUT_MS = 3000;
const SINGLE_WORD_RE = /^[a-z'-]+$/i;

interface DictionaryPhonetic {
  audio?: string;
}

interface DictionaryEntry {
  phonetics?: DictionaryPhonetic[];
}

export async function lookupDictionaryAudio(text: string): Promise<string | null> {
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
