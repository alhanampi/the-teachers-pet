import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { WordOrderExercise } from "../../../types/exercise";
import { shuffleArray } from "../../../lib/shuffle";
import { Button } from "../../ui/Button";
import { Prompt } from "../Prompt";
import { Chip, ChosenChip, DragGhost, Placeholder, Row } from "./WordOrder.styles";

interface Props {
  exercise: WordOrderExercise;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const DRAG_THRESHOLD_PX = 6;

interface DragState {
  index: number;
  startX: number;
  startY: number;
  moved: boolean;
}

export function WordOrder({ exercise, onComplete, disabled }: Props) {
  const order = useMemo(() => shuffleArray(exercise.words), [exercise.words]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const justDraggedRef = useRef(false);

  const usedIndices = useMemo(() => new Set(chosen), [chosen]);
  const isComplete = chosen.length === order.length;

  const pickFromPool = (poolIndex: number) => {
    if (disabled || answered || usedIndices.has(poolIndex)) return;
    setChosen((prev) => [...prev, poolIndex]);
  };

  const removeChosen = (index: number) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (disabled || answered) return;
    setChosen((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (disabled || answered || !isComplete) return;
    setAnswered(true);
    const built = chosen.map((poolIndex) => order[poolIndex]).join(" ");
    onComplete(built.toLowerCase() === exercise.answer.toLowerCase());
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (disabled || answered) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, startX: e.clientX, startY: e.clientY, moved: false };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      setDragging(order[chosen[drag.index]]);
    }
    if (!drag.moved) return;
    setDragPosition({ x: e.clientX, y: e.clientY });

    const target = document.elementFromPoint(e.clientX, e.clientY);
    const el = target?.closest<HTMLElement>("[data-chosen-index]");
    const hoverIndex = el ? Number(el.dataset.chosenIndex) : null;
    if (hoverIndex !== null && hoverIndex !== drag.index) {
      const from = drag.index;
      setChosen((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(hoverIndex, 0, moved);
        return next;
      });
      drag.index = hoverIndex;
    }
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.moved) justDraggedRef.current = true;
    setDragging(null);
    setDragPosition(null);
  };

  return (
    <div>
      <Prompt hint={exercise.hint}>{exercise.prompt}</Prompt>
      <Row>
        {chosen.length === 0 && !answered && (
          <Placeholder>👉 Tap words below to build your answer</Placeholder>
        )}
        {chosen.map((poolIndex, index) => (
          <ChosenChip
            key={index}
            type="button"
            data-chosen-index={index}
            disabled={disabled || answered}
            onClick={() => removeChosen(index)}
            onPointerDown={(e) => handlePointerDown(e, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {order[poolIndex]}
          </ChosenChip>
        ))}
      </Row>
      <Row>
        {order.map((word, index) => (
          <Chip
            key={index}
            type="button"
            $used={usedIndices.has(index)}
            onClick={() => pickFromPool(index)}
            disabled={disabled || answered || usedIndices.has(index)}
          >
            {word}
          </Chip>
        ))}
      </Row>
      <Button type="button" onClick={handleCheck} disabled={disabled || answered || !isComplete}>
        Check
      </Button>
      {dragging && dragPosition && (
        <DragGhost $x={dragPosition.x} $y={dragPosition.y}>
          {dragging}
        </DragGhost>
      )}
    </div>
  );
}
