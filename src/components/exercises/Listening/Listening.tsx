import { useEffect, useMemo, useRef, useState } from "react";
import type { ListeningExercise, ListeningItem } from "../../../types/exercise";
import { shuffleArray } from "../../../lib/shuffle";
import { Prompt } from "../Prompt";
import { Options, OptionButton, type OptionState } from "../MultipleChoice/MultipleChoice.styles";
import { FallbackMessage, PlayButton, PlayWrapper } from "./Listening.styles";

interface Props {
  exercise: ListeningExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const WRONG_FLASH_MS = 1200;
const FALLBACK_TIMEOUT_MS = 1500;
const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function Listening({ exercise, onComplete, disabled }: Props) {
  const order = useMemo(() => shuffleArray(exercise.items), [exercise.items]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDone = matched.size === exercise.items.length;
  const current = order.find((item) => !matched.has(item.text)) ?? null;

  useEffect(() => {
    if (isDone) onComplete(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (speechSupported) window.speechSynthesis.cancel();
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (!current) return;
    setPlaybackFailed(false);

    if (current.audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = current.audioUrl;
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      }
      return;
    }

    if (!speechSupported) {
      setPlaybackFailed(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = setTimeout(() => setPlaybackFailed(true), FALLBACK_TIMEOUT_MS);
    utterance.onstart = () => {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
    utterance.onerror = () => setPlaybackFailed(true);

    window.speechSynthesis.speak(utterance);
  };

  const handleTap = (item: ListeningItem) => {
    if (disabled || isDone || matched.has(item.text) || !current) return;
    if (item.text === current.text) {
      setMatched((prev) => new Set(prev).add(item.text));
      return;
    }
    setWrongTile(item.text);
    setTimeout(() => setWrongTile(null), WRONG_FLASH_MS);
  };

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>
      <PlayWrapper>
        <PlayButton type="button" onClick={handlePlay} disabled={disabled || isDone || !current}>
          🔊 Play
        </PlayButton>
        {playbackFailed && (
          <FallbackMessage>
            Audio isn't available on this device right now. Ask a grown-up for help! 🙋
          </FallbackMessage>
        )}
      </PlayWrapper>
      <Options>
        {order.map((item) => {
          let state: OptionState = "neutral";
          if (matched.has(item.text)) state = "correct";
          else if (wrongTile === item.text) state = "incorrect";
          return (
            <OptionButton
              key={item.text}
              type="button"
              $state={state}
              disabled={disabled || isDone || matched.has(item.text)}
              onClick={() => handleTap(item)}
            >
              {item.text}
            </OptionButton>
          );
        })}
      </Options>
      <audio ref={audioRef} hidden />
    </div>
  );
}
