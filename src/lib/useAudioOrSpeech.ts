import { useEffect, useRef, useState } from "react";
import { findEnglishVoice } from "./speechSupport";

const RETRY_AFTER_MS = 700;
const FALLBACK_TIMEOUT_MS = 1800;
const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export type PlaybackFailureReason = "no-english-voice" | "unavailable";

export interface PlayableItem {
  text: string;
  audioUrl: string | null;
}

function normalizeAudioUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

export function useAudioOrSpeech() {
  const [failure, setFailure] = useState<PlaybackFailureReason | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!speechSupported) return;
    // Android Chrome loads voices asynchronously; without this warm-up the very first
    // speak() of the session can silently do nothing while the list is still empty.
    window.speechSynthesis.getVoices();
    const warmUp = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warmUp);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warmUp);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (speechSupported) window.speechSynthesis.cancel();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, []);

  const play = (item: PlayableItem) => {
    setFailure(null);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);

    if (item.audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = normalizeAudioUrl(item.audioUrl);
      audio.currentTime = 0;
      audio.play().catch(() => setFailure("unavailable"));
      return;
    }

    if (!speechSupported) {
      setFailure("unavailable");
      return;
    }

    const englishVoice = findEnglishVoice();
    // An empty voice list usually just means voices haven't loaded yet (handled below by
    // the retry/timeout); a populated list with no "en*" entry means this device's TTS
    // engine genuinely has no English voice installed, so retrying won't help.
    if (window.speechSynthesis.getVoices().length > 0 && !englishVoice) {
      setFailure("no-english-voice");
      return;
    }

    let started = false;
    const attempt = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "en-US";
      if (englishVoice) utterance.voice = englishVoice;
      utterance.rate = 0.85;
      utterance.onstart = () => {
        started = true;
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      };
      utterance.onerror = () => setFailure("unavailable");
      window.speechSynthesis.speak(utterance);
    };

    attempt();
    // Some Android Chrome versions drop the first speak() after the synth engine has been
    // idle; a single cancel()+speak() retry is a known, cheap way to unstick it.
    retryTimeoutRef.current = setTimeout(() => {
      if (!started) attempt();
    }, RETRY_AFTER_MS);
    fallbackTimeoutRef.current = setTimeout(() => {
      if (!started) setFailure("unavailable");
    }, FALLBACK_TIMEOUT_MS);
  };

  const audioProps = {
    ref: audioRef,
    onError: () => setFailure("unavailable"),
  };

  return { play, failed: failure !== null, failureReason: failure, audioProps };
}
