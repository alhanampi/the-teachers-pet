import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useClerk } from "@clerk/clerk-react";
import type { Difficulty, Level } from "../types/exercise";
import { recordAttempt } from "../lib/api";
import { chooseTeacher, startSession } from "../lib/studentApi";
import { Screen, Subtitle } from "../components/ui/Screen";

export type Step = "onboarding" | "level" | "difficulty" | "exercise" | "summary";

interface StudentState {
  step: Step;
  studentId: string | null;
  name: string;
  teacherId: string | null;
  points: number;
  level: Level | null;
  difficulty: Difficulty | null;
}

type Action =
  | {
      type: "SESSION_READY";
      studentId: string;
      name: string;
      points: number;
      teacherId: string | null;
    }
  | { type: "ONBOARDING_COMPLETE"; teacherId: string }
  | { type: "SELECT_LEVEL"; level: Level }
  | { type: "SELECT_DIFFICULTY"; difficulty: Difficulty }
  | { type: "POINTS_UPDATED"; points: number }
  | { type: "FINISH_EXERCISES" }
  | { type: "PLAY_AGAIN" }
  | { type: "GO_BACK" };

const initialState: StudentState = {
  step: "onboarding",
  studentId: null,
  name: "",
  teacherId: null,
  points: 0,
  level: null,
  difficulty: null,
};

function reducer(state: StudentState, action: Action): StudentState {
  switch (action.type) {
    case "SESSION_READY":
      return {
        ...state,
        step: action.teacherId ? "level" : "onboarding",
        studentId: action.studentId,
        name: action.name,
        points: action.points,
        teacherId: action.teacherId,
      };
    case "ONBOARDING_COMPLETE":
      return { ...state, step: "level", teacherId: action.teacherId };
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
    case "GO_BACK":
      if (state.step === "difficulty") return { ...state, step: "level" };
      if (state.step === "exercise") return { ...state, step: "difficulty" };
      return state;
    default:
      return state;
  }
}

interface StudentContextValue extends StudentState {
  selectLevel: (level: Level) => void;
  selectDifficulty: (difficulty: Difficulty) => void;
  completeExercise: (exerciseId: string, correct: boolean) => void;
  finishExercises: () => void;
  playAgain: () => void;
  completeOnboarding: (teacherId: string) => Promise<void>;
  goBack: () => void;
  signOut: () => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { signOut: clerkSignOut } = useClerk();

  useEffect(() => {
    startSession()
      .then(({ studentId, name, points, teacherId }) =>
        dispatch({ type: "SESSION_READY", studentId, name, points, teacherId }),
      )
      .catch(() => {
        console.warn("Could not start the session.");
      });
  }, []);

  const completeOnboarding = useCallback(async (teacherId: string) => {
    const result = await chooseTeacher(teacherId);
    dispatch({ type: "ONBOARDING_COMPLETE", teacherId: result.teacherId ?? teacherId });
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
    [state.studentId, state.level, state.difficulty, state.points],
  );

  const finishExercises = useCallback(() => dispatch({ type: "FINISH_EXERCISES" }), []);
  const playAgain = useCallback(() => dispatch({ type: "PLAY_AGAIN" }), []);
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const signOut = useCallback(() => {
    void clerkSignOut();
  }, [clerkSignOut]);

  if (!state.studentId) {
    return (
      <Screen>
        <Subtitle>Loading...</Subtitle>
      </Screen>
    );
  }

  const value: StudentContextValue = {
    ...state,
    selectLevel,
    selectDifficulty,
    completeExercise,
    finishExercises,
    playAgain,
    completeOnboarding,
    goBack,
    signOut,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its Provider, standard Context pattern
export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within a StudentProvider");
  return ctx;
}
