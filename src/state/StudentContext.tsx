import { createContext, useCallback, useContext, useReducer, type ReactNode } from "react";
import type { Difficulty, Level } from "../types/exercise";
import { recordAttempt, startSession } from "../lib/api";

export type Step = "welcome" | "level" | "difficulty" | "exercise" | "summary";

interface StudentState {
  step: Step;
  studentId: string | null;
  name: string;
  points: number;
  level: Level | null;
  difficulty: Difficulty | null;
}

type Action =
  | { type: "SESSION_READY"; studentId: string; name: string; points: number }
  | { type: "SELECT_LEVEL"; level: Level }
  | { type: "SELECT_DIFFICULTY"; difficulty: Difficulty }
  | { type: "POINTS_UPDATED"; points: number }
  | { type: "FINISH_EXERCISES" }
  | { type: "PLAY_AGAIN" }
  | { type: "RESTART" }
  | { type: "GO_BACK" };

const initialState: StudentState = {
  step: "welcome",
  studentId: null,
  name: "",
  points: 0,
  level: null,
  difficulty: null,
};

function reducer(state: StudentState, action: Action): StudentState {
  switch (action.type) {
    case "SESSION_READY":
      return {
        ...state,
        step: "level",
        studentId: action.studentId,
        name: action.name,
        points: action.points,
      };
    case "SELECT_LEVEL":
      return { ...state, level: action.level, step: "difficulty" };
    case "SELECT_DIFFICULTY":
      return { ...state, difficulty: action.difficulty, step: "exercise" };
    case "POINTS_UPDATED":
      return { ...state, points: action.points };
    case "FINISH_EXERCISES":
      return { ...state, step: "summary" };
    case "PLAY_AGAIN":
      return { ...state, step: "level", level: null, difficulty: null };
    case "RESTART":
      return { ...initialState };
    case "GO_BACK":
      if (state.step === "difficulty") return { ...state, step: "level" };
      if (state.step === "exercise") return { ...state, step: "difficulty" };
      return state;
    default:
      return state;
  }
}

const STORAGE_KEY = "englishApp.progress";

interface StoredProgress {
  studentId: string;
  name: string;
  points: number;
}

function readStoredProgress(): StoredProgress | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return null;
  }
}

function writeStoredProgress(progress: StoredProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function initState(): StudentState {
  const stored = readStoredProgress();
  if (!stored) return initialState;
  return {
    ...initialState,
    step: "level",
    studentId: stored.studentId,
    name: stored.name,
    points: stored.points,
  };
}

interface StudentContextValue extends StudentState {
  submitName: (name: string) => void;
  selectLevel: (level: Level) => void;
  selectDifficulty: (difficulty: Difficulty) => void;
  completeExercise: (exerciseId: string, correct: boolean) => void;
  finishExercises: () => void;
  playAgain: () => void;
  changeName: () => void;
  goBack: () => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  const submitName = useCallback((name: string) => {
    const studentId = crypto.randomUUID();
    writeStoredProgress({ studentId, name, points: 0 });
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }
    dispatch({ type: "SESSION_READY", studentId, name, points: 0 });
    startSession(name, studentId).catch(() => {
      console.warn("Could not sync the session with the server; still using localStorage.");
    });
  }, []);

  const selectLevel = useCallback((level: Level) => dispatch({ type: "SELECT_LEVEL", level }), []);

  const selectDifficulty = useCallback(
    (difficulty: Difficulty) => dispatch({ type: "SELECT_DIFFICULTY", difficulty }),
    [],
  );

  const completeExercise = useCallback(
    (exerciseId: string, correct: boolean) => {
      if (!state.studentId || !state.level || !state.difficulty) return;
      const points = state.points + 1;
      writeStoredProgress({ studentId: state.studentId, name: state.name, points });
      dispatch({ type: "POINTS_UPDATED", points });
      recordAttempt({
        studentId: state.studentId,
        exerciseId,
        level: state.level,
        difficulty: state.difficulty,
        correct,
      }).catch(() => {
        console.warn("Could not sync the point with the server; saved locally.");
      });
    },
    [state.studentId, state.name, state.level, state.difficulty, state.points],
  );

  const finishExercises = useCallback(() => dispatch({ type: "FINISH_EXERCISES" }), []);
  const playAgain = useCallback(() => dispatch({ type: "PLAY_AGAIN" }), []);
  const changeName = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESTART" });
  }, []);

  const goBack = useCallback(() => {
    if (state.step === "level") {
      changeName();
      return;
    }
    dispatch({ type: "GO_BACK" });
  }, [state.step, changeName]);

  const value: StudentContextValue = {
    ...state,
    submitName,
    selectLevel,
    selectDifficulty,
    completeExercise,
    finishExercises,
    playAgain,
    changeName,
    goBack,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its Provider, standard Context pattern
export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within a StudentProvider");
  return ctx;
}
