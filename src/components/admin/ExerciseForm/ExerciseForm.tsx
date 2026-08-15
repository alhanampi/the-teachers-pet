import { useState, type FormEvent } from "react";
import { createExercise, updateExercise, type NewExercisePayload } from "../../../lib/adminApi";
import { fetchDictionaryAudio } from "../../../lib/api";
import { useAudioOrSpeech } from "../../../lib/useAudioOrSpeech";
import type { Difficulty, Exercise, Level } from "../../../types/exercise";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import {
  AddButton,
  ErrorMessage,
  FieldList,
  FieldRow,
  Form,
  HelperText,
  PreviewButton,
  RemoveButton,
  Row,
} from "./ExerciseForm.styles";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const TYPES: { value: Exercise["type"]; label: string }[] = [
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "fill-blank", label: "Fill in the blank" },
  { value: "matching", label: "Matching" },
  { value: "word-order", label: "Word order" },
  { value: "listening", label: "Listening" },
];

const DEFAULT_OPTIONS = ["", ""];
const DEFAULT_PAIRS = [
  { left: "", right: "" },
  { left: "", right: "" },
  { left: "", right: "" },
];
const DEFAULT_WORDS = ["", ""];
const DEFAULT_LISTENING_ITEMS = ["", "", "", ""];

interface Props {
  initialValue?: Exercise;
  mode: "create" | "edit";
  onSaved: (exercise: Exercise) => void;
  onCancel: () => void;
}

export function ExerciseForm({ initialValue, mode, onSaved, onCancel }: Props) {
  const [level, setLevel] = useState<Level>(initialValue?.level ?? "A1");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialValue?.difficulty ?? "easy");
  const [type, setType] = useState<Exercise["type"]>(initialValue?.type ?? "multiple-choice");
  const [prompt, setPrompt] = useState(initialValue?.prompt ?? "");
  const [hint, setHint] = useState(initialValue?.hint ?? "");
  const [options, setOptions] = useState(
    initialValue && initialValue.type === "multiple-choice"
      ? initialValue.options
      : DEFAULT_OPTIONS,
  );
  const [answer, setAnswer] = useState(
    initialValue && (initialValue.type === "multiple-choice" || initialValue.type === "fill-blank")
      ? initialValue.answer
      : "",
  );
  const [pairs, setPairs] = useState(
    initialValue && initialValue.type === "matching" ? initialValue.pairs : DEFAULT_PAIRS,
  );
  const [words, setWords] = useState(
    initialValue && initialValue.type === "word-order" ? initialValue.words : DEFAULT_WORDS,
  );
  const [listeningItems, setListeningItems] = useState(
    initialValue && initialValue.type === "listening"
      ? initialValue.items.map((item) => item.text)
      : DEFAULT_LISTENING_ITEMS,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewingIndex, setPreviewingIndex] = useState<number | null>(null);
  const {
    play: playPreview,
    failed: previewFailed,
    audioProps: previewAudioProps,
  } = useAudioOrSpeech();

  const handlePreview = async (index: number) => {
    const text = listeningItems[index].trim();
    if (!text) return;
    setPreviewingIndex(index);
    try {
      const { audioUrl } = await fetchDictionaryAudio(text);
      playPreview({ text, audioUrl });
    } catch {
      playPreview({ text, audioUrl: null });
    } finally {
      setPreviewingIndex(null);
    }
  };

  const isValid = (() => {
    if (!prompt.trim()) return false;
    if (type === "multiple-choice") {
      const cleanOptions = options.map((option) => option.trim()).filter(Boolean);
      return cleanOptions.length >= 2 && cleanOptions.includes(answer.trim()) && !!answer.trim();
    }
    if (type === "fill-blank") {
      return !!answer.trim();
    }
    if (type === "word-order") {
      const cleanWords = words.map((word) => word.trim()).filter(Boolean);
      return cleanWords.length >= 2;
    }
    if (type === "listening") {
      const cleanItems = listeningItems.map((item) => item.trim());
      return (
        cleanItems.every(Boolean) &&
        new Set(cleanItems.map((item) => item.toLowerCase())).size === cleanItems.length
      );
    }
    const cleanPairs = pairs.filter((pair) => pair.left.trim() && pair.right.trim());
    return cleanPairs.length >= 3;
  })();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    const payload: NewExercisePayload = {
      level,
      difficulty,
      type,
      prompt: prompt.trim(),
      hint: hint.trim() || undefined,
    };

    if (type === "multiple-choice") {
      payload.options = options.map((option) => option.trim()).filter(Boolean);
      payload.answer = answer.trim();
    } else if (type === "fill-blank") {
      payload.answer = answer.trim();
    } else if (type === "word-order") {
      payload.words = words.map((word) => word.trim()).filter(Boolean);
    } else if (type === "listening") {
      payload.items = listeningItems.map((item) => item.trim());
    } else {
      payload.pairs = pairs
        .map((pair) => ({ left: pair.left.trim(), right: pair.right.trim() }))
        .filter((pair) => pair.left && pair.right);
    }

    setSubmitting(true);
    setError(null);
    try {
      const saved =
        mode === "edit" && initialValue
          ? await updateExercise(initialValue.id, payload)
          : await createExercise(payload);
      onSaved(saved);
    } catch {
      setError("Could not save the exercise.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Select
          $compact
          label="Level"
          value={level}
          onChange={(event) => setLevel(event.target.value as Level)}
          options={LEVELS.map((value) => ({ value, label: value }))}
        />
        <Select
          $compact
          label="Difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          options={DIFFICULTIES.map((value) => ({ value, label: value }))}
        />
      </Row>
      <Select
        $compact
        label="Type"
        value={type}
        onChange={(event) => setType(event.target.value as Exercise["type"])}
        options={TYPES}
      />
      <Input
        $compact
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Prompt (what the student sees)"
        maxLength={300}
        required
      />

      {type === "multiple-choice" && (
        <FieldList>
          {options.map((option, index) => (
            <FieldRow key={index}>
              <Input
                $compact
                value={option}
                onChange={(event) => {
                  const next = [...options];
                  next[index] = event.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${index + 1}`}
                maxLength={100}
              />
              {options.length > 2 && (
                <RemoveButton
                  type="button"
                  onClick={() => setOptions(options.filter((_, i) => i !== index))}
                  aria-label="Remove option"
                >
                  ✕
                </RemoveButton>
              )}
            </FieldRow>
          ))}
          {options.length < 6 && (
            <AddButton type="button" onClick={() => setOptions([...options, ""])}>
              + Add option
            </AddButton>
          )}
          <Select
            $compact
            label="Correct answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            options={[
              { value: "", label: "Choose the correct option" },
              ...options
                .filter((option) => option.trim())
                .map((option) => ({
                  value: option,
                  label: option,
                })),
            ]}
          />
        </FieldList>
      )}

      {type === "fill-blank" && (
        <Input
          $compact
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Correct answer"
          maxLength={200}
        />
      )}

      {type === "word-order" && (
        <FieldList>
          {words.map((word, index) => (
            <FieldRow key={index}>
              <Input
                $compact
                value={word}
                onChange={(event) => {
                  const next = [...words];
                  next[index] = event.target.value;
                  setWords(next);
                }}
                placeholder={`Word ${index + 1}`}
                maxLength={40}
              />
              {words.length > 2 && (
                <RemoveButton
                  type="button"
                  onClick={() => setWords(words.filter((_, i) => i !== index))}
                  aria-label="Remove word"
                >
                  ✕
                </RemoveButton>
              )}
            </FieldRow>
          ))}
          {words.length < 20 && (
            <AddButton type="button" onClick={() => setWords([...words, ""])}>
              + Add word
            </AddButton>
          )}
        </FieldList>
      )}

      {type === "listening" && (
        <FieldList>
          {listeningItems.map((item, index) => (
            <FieldRow key={index}>
              <Input
                $compact
                value={item}
                onChange={(event) => {
                  const next = [...listeningItems];
                  next[index] = event.target.value;
                  setListeningItems(next);
                }}
                placeholder={`Word or phrase ${index + 1}`}
                maxLength={100}
              />
              <PreviewButton
                type="button"
                onClick={() => handlePreview(index)}
                disabled={!item.trim() || previewingIndex === index}
                aria-label="Preview pronunciation"
              >
                🔊
              </PreviewButton>
            </FieldRow>
          ))}
          <HelperText>
            Single common English words get real pronunciation audio automatically; phrases will use
            the device's built-in voice instead. Use 🔊 to preview exactly what the student will
            hear.
          </HelperText>
          {previewFailed && <HelperText>Couldn't play a preview on this device.</HelperText>}
          <audio {...previewAudioProps} hidden />
        </FieldList>
      )}

      {type === "matching" && (
        <FieldList>
          {pairs.map((pair, index) => (
            <FieldRow key={index}>
              <Input
                $compact
                value={pair.left}
                onChange={(event) => {
                  const next = [...pairs];
                  next[index] = { ...next[index], left: event.target.value };
                  setPairs(next);
                }}
                placeholder="Left"
                maxLength={100}
              />
              <Input
                $compact
                value={pair.right}
                onChange={(event) => {
                  const next = [...pairs];
                  next[index] = { ...next[index], right: event.target.value };
                  setPairs(next);
                }}
                placeholder="Right"
                maxLength={100}
              />
              {pairs.length > 3 && (
                <RemoveButton
                  type="button"
                  onClick={() => setPairs(pairs.filter((_, i) => i !== index))}
                  aria-label="Remove pair"
                >
                  ✕
                </RemoveButton>
              )}
            </FieldRow>
          ))}
          {pairs.length < 10 && (
            <AddButton type="button" onClick={() => setPairs([...pairs, { left: "", right: "" }])}>
              + Add pair
            </AddButton>
          )}
        </FieldList>
      )}

      <Input
        $compact
        value={hint}
        onChange={(event) => setHint(event.target.value)}
        placeholder="Hint (optional)"
        maxLength={200}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Row>
        <Button type="button" $variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </Row>
    </Form>
  );
}
