import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { MatchingExercise } from "../../../types/exercise";
import { shuffleArray } from "../../../lib/shuffle";
import { Prompt } from "../Prompt";
import { Column, Columns, DragGhost, Item } from "./Matching.styles";

interface Props {
  exercise: MatchingExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const MAX_MISTAKES = 3;
const WRONG_FLASH_MS = 1200;
const DRAG_THRESHOLD_PX = 6;

interface DragState {
  left: string;
  startX: number;
  startY: number;
  moved: boolean;
}

export function Matching({ exercise, onComplete, disabled }: Props) {
  const rightOptions = useMemo(
    () => shuffleArray(exercise.pairs.map((pair) => pair.right)),
    [exercise.pairs],
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [revealedLefts, setRevealedLefts] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [draggingLeft, setDraggingLeft] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const lockedRef = useRef(false);
  const mistakesRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const justDraggedRef = useRef(false);

  const isDone = Object.keys(matched).length === exercise.pairs.length;

  useEffect(() => {
    if (isDone) onComplete(!failed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  const attemptMatch = (left: string, right: string) => {
    if (disabled || isDone || lockedRef.current) return;
    const pair = exercise.pairs.find((candidate) => candidate.left === left);
    if (pair?.right === right) {
      setMatched((prev) => ({ ...prev, [left]: right }));
      setSelectedLeft(null);
      return;
    }

    setWrongPair({ left, right });
    setSelectedLeft(null);
    mistakesRef.current += 1;
    if (mistakesRef.current >= MAX_MISTAKES) lockedRef.current = true;

    setTimeout(() => {
      setWrongPair(null);
      if (!lockedRef.current) return;
      const stillUnmatched = exercise.pairs.filter((candidate) => !matched[candidate.left]);
      setFailed(true);
      setRevealedLefts(new Set(stillUnmatched.map((candidate) => candidate.left)));
      setMatched((prev) => {
        const next = { ...prev };
        stillUnmatched.forEach((candidate) => {
          next[candidate.left] = candidate.right;
        });
        return next;
      });
    }, WRONG_FLASH_MS);
  };

  const pickLeft = (left: string) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (disabled || isDone || matched[left]) return;
    setSelectedLeft(left);
  };

  const pickRight = (right: string) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (disabled || isDone || !selectedLeft) return;
    attemptMatch(selectedLeft, right);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, left: string) => {
    if (disabled || isDone || matched[left]) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { left, startX: e.clientX, startY: e.clientY, moved: false };
    setSelectedLeft(left);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      setDraggingLeft(drag.left);
    }
    if (drag.moved) setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.moved) {
      justDraggedRef.current = true;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const rightEl = target?.closest<HTMLElement>("[data-right]");
      const right = rightEl?.dataset.right;
      if (right && !matchedRights.has(right)) {
        attemptMatch(drag.left, right);
      } else {
        setSelectedLeft(null);
      }
    }
    setDraggingLeft(null);
    setDragPosition(null);
  };

  const matchedRights = new Set(Object.values(matched));
  const revealedRights = new Set(
    Array.from(revealedLefts)
      .map((left) => matched[left])
      .filter((right): right is string => Boolean(right)),
  );

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>
      <Columns>
        <Column>
          {exercise.pairs.map((pair) => (
            <Item
              key={pair.left}
              type="button"
              $state={
                revealedLefts.has(pair.left)
                  ? "revealed"
                  : matched[pair.left]
                    ? "matched"
                    : wrongPair?.left === pair.left
                      ? "wrong"
                      : selectedLeft === pair.left
                        ? "selected"
                        : "neutral"
              }
              disabled={disabled || isDone || !!matched[pair.left]}
              onClick={() => pickLeft(pair.left)}
              onPointerDown={(e) => handlePointerDown(e, pair.left)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {pair.left}
            </Item>
          ))}
        </Column>
        <Column>
          {rightOptions.map((right) => (
            <Item
              key={right}
              type="button"
              data-right={right}
              $state={
                revealedRights.has(right)
                  ? "revealed"
                  : matchedRights.has(right)
                    ? "matched"
                    : wrongPair?.right === right
                      ? "wrong"
                      : "neutral"
              }
              disabled={disabled || isDone || matchedRights.has(right)}
              onClick={() => pickRight(right)}
            >
              {right}
            </Item>
          ))}
        </Column>
      </Columns>
      {draggingLeft && dragPosition && (
        <DragGhost $x={dragPosition.x} $y={dragPosition.y}>
          {draggingLeft}
        </DragGhost>
      )}
    </div>
  );
}
