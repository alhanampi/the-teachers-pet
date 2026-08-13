import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authClient } from "../lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface TeacherContextValue {
  status: AuthStatus;
  teacherName: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [teacherName, setTeacherName] = useState<string | null>(null);

  useEffect(() => {
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.session && data.user) {
          setTeacherName(data.user.name);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error || !result.data) {
      throw new Error(result.error?.message ?? "Could not sign in");
    }
    setTeacherName(result.data.user.name);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    setTeacherName(null);
    setStatus("unauthenticated");
  }, []);

  const value: TeacherContextValue = { status, teacherName, login, logout };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its Provider, standard Context pattern
export function useTeacher(): TeacherContextValue {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error("useTeacher must be used within a TeacherProvider");
  return ctx;
}
