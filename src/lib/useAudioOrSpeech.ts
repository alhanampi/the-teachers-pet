import { useEffect, useRef, useState } from "react";

const FALLBACK_TIMEOUT_MS = 1500;
const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export interface PlayableItem {
  text: string;
  audioUrl: string | null;
}

function normalizeAudioUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

export function useAudioOrSpeech() {
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (speechSupported) window.speechSynthesis.cancel();
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, []);

  const play = (item: PlayableItem) => {
    setFailed(false);

    if (item.audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = normalizeAudioUrl(item.audioUrl);
      audio.currentTime = 0;
      audio.play().catch(() => setFailed(true));
      return;
    }

    if (!speechSupported) {
      setFailed(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = setTimeout(() => setFailed(true), FALLBACK_TIMEOUT_MS);
    utterance.onstart = () => {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
    utterance.onerror = () => setFailed(true);

    window.speechSynthesis.speak(utterance);
  };

  const audioProps = {
    ref: audioRef,
    onError: () => setFailed(true),
  };

  return { play, failed, audioProps };
}
