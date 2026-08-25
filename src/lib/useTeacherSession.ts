import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchTeacherSession, type TeacherSession } from "./adminApi";

type State =
  { kind: "loading" } | { kind: "not-linked" } | { kind: "linked"; session: TeacherSession };

export type TeacherSessionStatus = State | { kind: "signed-out" };

export function useTeacherSession(): TeacherSessionStatus {
  const { isLoaded, isSignedIn } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;

    fetchTeacherSession()
      .then((session) => {
        if (cancelled) return;
        setState(session ? { kind: "linked", session } : { kind: "not-linked" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "not-linked" });
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return { kind: "loading" };
  if (!isSignedIn) return { kind: "signed-out" };
  return state;
}
