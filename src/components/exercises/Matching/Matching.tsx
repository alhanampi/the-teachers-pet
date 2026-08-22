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

type Side = "left" | "right";

const WRONG_FLASH_MS = 1200;
const DRAG_THRESHOLD_PX = 6;

interface Selected {
  side: Side;
  value: string;
}

interface DragState {
  side: Side;
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
  const [selected, setSelected] = useState<Selected | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [dragging, setDragging] = useState<{ side: Side; value: string } | null>(null);
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
      setSelected(null);
      return;
    }

    setWrongPair({ left, right });
    setSelected(null);
    setTimeout(() => setWrongPair(null), WRONG_FLASH_MS);
  };

  const pick = (side: Side, value: string) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (disabled || isDone) return;
    if (side === "left" ? matched[value] : matchedRights.has(value)) return;

    if (!selected || selected.side === side) {
      setSelected({ side, value });
      return;
    }

    const left = side === "left" ? value : selected.value;
    const right = side === "right" ? value : selected.value;
    attemptMatch(left, right);
  };

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLButtonElement>,
    side: Side,
    value: string,
  ) => {
    if (disabled || isDone) return;
    if (side === "left" ? matched[value] : matchedRights.has(value)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { side, value, startX: e.clientX, startY: e.clientY, moved: false };
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
      const targetSelector = drag.side === "left" ? "[data-right]" : "[data-left]";
      const targetEl = target?.closest<HTMLElement>(targetSelector);
      const targetValue = drag.side === "left" ? targetEl?.dataset.right : targetEl?.dataset.left;
      const targetTaken = targetValue
        ? drag.side === "left"
          ? matchedRights.has(targetValue)
          : !!matched[targetValue]
        : false;

      if (targetValue && !targetTaken) {
        const left = drag.side === "left" ? drag.value : targetValue;
        const right = drag.side === "left" ? targetValue : drag.value;
        attemptMatch(left, right);
      } else {
        setSelected(null);
      }
    }
    setDragging(null);
    setDragPosition(null);
  };

  const matchedRights = new Set(Object.values(matched));

  return (
    <div>
      <Prompt hint={exercise.hint}>{exercise.prompt}</Prompt>
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
                    : selected?.side === "left" && selected.value === pair.left
                      ? "selected"
                      : "neutral"
              }
              disabled={disabled || isDone || !!matched[pair.left]}
              onClick={() => pick("left", pair.left)}
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
                    : selected?.side === "right" && selected.value === right
                      ? "selected"
                      : "neutral"
              }
              disabled={disabled || isDone || matchedRights.has(right)}
              onClick={() => pick("right", right)}
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
