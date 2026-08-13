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

const WRONG_FLASH_MS = 1200;
const DRAG_THRESHOLD_PX = 6;

interface DragState {
  side: "left" | "right";
  value: string;
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
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [dragging, setDragging] = useState<{ side: "left" | "right"; value: string } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const justDraggedRef = useRef(false);

  const isDone = Object.keys(matched).length === exercise.pairs.length;

  useEffect(() => {
    if (isDone) onComplete(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  const attemptMatch = (left: string, right: string) => {
    if (disabled || isDone) return;
    const pair = exercise.pairs.find((candidate) => candidate.left === left);
    if (pair?.right === right) {
      setMatched((prev) => ({ ...prev, [left]: right }));
      setSelectedLeft(null);
      return;
    }

    setWrongPair({ left, right });
    setSelectedLeft(null);
    setTimeout(() => setWrongPair(null), WRONG_FLASH_MS);
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

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLButtonElement>,
    side: "left" | "right",
    value: string,
  ) => {
    if (disabled || isDone) return;
    if (side === "left" ? matched[value] : matchedRights.has(value)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { side, value, startX: e.clientX, startY: e.clientY, moved: false };
    if (side === "left") setSelectedLeft(value);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      setDragging({ side: drag.side, value: drag.value });
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
      if (drag.side === "left") {
        const rightEl = target?.closest<HTMLElement>("[data-right]");
        const right = rightEl?.dataset.right;
        if (right && !matchedRights.has(right)) {
          attemptMatch(drag.value, right);
        } else {
          setSelectedLeft(null);
        }
      } else {
        const leftEl = target?.closest<HTMLElement>("[data-left]");
        const left = leftEl?.dataset.left;
        if (left && !matched[left]) {
          attemptMatch(left, drag.value);
        }
      }
    }
    setDragging(null);
    setDragPosition(null);
  };

  const matchedRights = new Set(Object.values(matched));

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>
      <Columns>
        <Column>
          {exercise.pairs.map((pair) => (
            <Item
              key={pair.left}
              type="button"
              data-left={pair.left}
              $state={
                matched[pair.left]
                  ? "matched"
                  : wrongPair?.left === pair.left
                    ? "wrong"
                    : selectedLeft === pair.left
                      ? "selected"
                      : "neutral"
              }
              disabled={disabled || isDone || !!matched[pair.left]}
              onClick={() => pickLeft(pair.left)}
              onPointerDown={(e) => handlePointerDown(e, "left", pair.left)}
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
                matchedRights.has(right)
                  ? "matched"
                  : wrongPair?.right === right
                    ? "wrong"
                    : "neutral"
              }
              disabled={disabled || isDone || matchedRights.has(right)}
              onClick={() => pickRight(right)}
              onPointerDown={(e) => handlePointerDown(e, "right", right)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {right}
            </Item>
          ))}
        </Column>
      </Columns>
      {dragging && dragPosition && (
        <DragGhost $x={dragPosition.x} $y={dragPosition.y}>
          {dragging.value}
        </DragGhost>
      )}
    </div>
  );
}
