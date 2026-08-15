const VOICES_WAIT_MS = 300;

const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function findEnglishVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported) return null;
  return (
    window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

export function detectEnglishSpeechSupport(): Promise<boolean> {
  if (!speechSupported) return Promise.resolve(false);

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(findEnglishVoice() !== null);

  // Android Chrome loads voices asynchronously — the list is empty until 'voiceschanged'
  // fires (or, on some devices, never fires at all, hence the timeout fallback).
  return new Promise((resolve) => {
    const finish = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      clearTimeout(timeout);
      resolve(findEnglishVoice() !== null);
    };
    const onVoicesChanged = () => finish();
    const timeout = setTimeout(finish, VOICES_WAIT_MS);
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
  });
}
