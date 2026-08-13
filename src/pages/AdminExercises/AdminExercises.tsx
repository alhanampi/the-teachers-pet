import { useEffect, useMemo, useState } from "react";
import { fetchExercises } from "../../lib/api";
import { deleteExercise } from "../../lib/adminApi";
import type { Difficulty, Exercise, Level } from "../../types/exercise";
import { Title } from "../../components/ui/Screen";
import { Select } from "../../components/ui/Select";
import { FloatingButton } from "../../components/ui/FloatingButton";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ExerciseForm } from "../../components/admin/ExerciseForm";
import {
  ActionButton,
  Actions,
  Answer,
  Count,
  ErrorMessage,
  Filters,
  Hint,
  List,
  ListItem,
  Meta,
  Prompt,
} from "./AdminExercises.styles";

const LEVEL_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "fill-blank", label: "Fill in the blank" },
  { value: "matching", label: "Matching" },
  { value: "word-order", label: "Word order" },
];

type ModalState =
  { mode: "create"; initialValue?: Exercise } | { mode: "edit"; initialValue: Exercise } | null;

function formatAnswer(exercise: Exercise): string {
  if (exercise.type === "matching") {
    return exercise.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(", ");
  }
  return exercise.answer;
}

export function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [type, setType] = useState<Exercise["type"] | "all">("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<Exercise | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises()
      .then(setExercises)
      .catch(() => setError("Could not load exercises."));
  }, []);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter(
      (exercise) =>
        (level === "all" || exercise.level === level) &&
        (difficulty === "all" || exercise.difficulty === difficulty) &&
        (type === "all" || exercise.type === type),
    );
  }, [exercises, level, difficulty, type]);

  const handleSaved = (saved: Exercise) => {
    setExercises((current) => {
      if (!current) return [saved];
      const exists = current.some((exercise) => exercise.id === saved.id);
      return exists
        ? current.map((exercise) => (exercise.id === saved.id ? saved : exercise))
        : [...current, saved];
    });
    setModal(null);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteExercise(pendingDelete.id);
      setExercises(
        (current) => current?.filter((exercise) => exercise.id !== pendingDelete.id) ?? current,
      );
      setDeleteError(null);
    } catch {
      setDeleteError("Could not delete the exercise.");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <Title>Exercises</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}

      <Filters>
        <Select
          label="Level"
          value={level}
          onChange={(event) => setLevel(event.target.value as Level | "all")}
          options={LEVEL_OPTIONS}
        />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty | "all")}
          options={DIFFICULTY_OPTIONS}
        />
        <Select
          label="Type"
          value={type}
          onChange={(event) => setType(event.target.value as Exercise["type"] | "all")}
          options={TYPE_OPTIONS}
        />
      </Filters>

      {exercises && <Count>{filtered.length} exercises</Count>}

      <List>
        {filtered.map((exercise) => (
          <ListItem key={exercise.id}>
            <Prompt>{exercise.prompt}</Prompt>
            <Meta>
              {exercise.level} · {exercise.difficulty} · {exercise.type}
            </Meta>
            <Answer>Answer: {formatAnswer(exercise)}</Answer>
            {exercise.hint && <Hint>Hint: {exercise.hint}</Hint>}
            <Actions>
              <ActionButton
                type="button"
                onClick={() => setModal({ mode: "edit", initialValue: exercise })}
              >
                Edit
              </ActionButton>
              <ActionButton
                type="button"
                onClick={() => setModal({ mode: "create", initialValue: exercise })}
              >
                Duplicate
              </ActionButton>
              <ActionButton type="button" $tone="danger" onClick={() => setPendingDelete(exercise)}>
                Delete
              </ActionButton>
            </Actions>
          </ListItem>
        ))}
      </List>

      <FloatingButton type="button" onClick={() => setModal({ mode: "create" })}>
        + New
      </FloatingButton>

      {modal && (
        <Modal
          title={modal.mode === "edit" ? "Edit exercise" : "New exercise"}
          onClose={() => setModal(null)}
        >
          <ExerciseForm
            mode={modal.mode}
            initialValue={modal.initialValue}
            onCancel={() => setModal(null)}
            onSaved={handleSaved}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`Delete "${pendingDelete.prompt}"? This can't be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
