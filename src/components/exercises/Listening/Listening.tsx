import { useEffect, useMemo, useState } from "react";
import type { ListeningExercise, ListeningItem } from "../../../types/exercise";
import { shuffleArray } from "../../../lib/shuffle";
import { useAudioOrSpeech } from "../../../lib/useAudioOrSpeech";
import { Prompt } from "../Prompt";
import { Options, OptionButton, type OptionState } from "../MultipleChoice/MultipleChoice.styles";
import { FallbackMessage, PlayButton, PlayWrapper } from "./Listening.styles";

interface Props {
  exercise: ListeningExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const WRONG_FLASH_MS = 1200;

export function Listening({ exercise, onComplete, disabled }: Props) {
  const order = useMemo(() => shuffleArray(exercise.items), [exercise.items]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const { play, failed, failureReason, audioProps } = useAudioOrSpeech();

  const isDone = matched.size === exercise.items.length;
  const current = order.find((item) => !matched.has(item.text)) ?? null;

  useEffect(() => {
    if (isDone) onComplete(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  const handlePlay = () => {
    if (current) play(current);
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
        {failed && (
          <FallbackMessage>
            {failureReason === "no-english-voice"
              ? "This phone doesn't have an English voice installed. Ask a grown-up to add one in Settings! 🙋"
              : "Audio isn't available on this device right now. Ask a grown-up for help! 🙋"}
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
      <audio {...audioProps} hidden />
    </div>
  );
}
