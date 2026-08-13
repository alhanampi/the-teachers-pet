import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useTeacher } from "../../state/TeacherContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { ErrorMessage, Form } from "./Auth.styles";

export function Auth() {
  const { status, login } = useTeacher();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Title>Teacher login</Title>
      <Subtitle>Sign in to manage students and exercises</Subtitle>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          autoComplete="username"
          autoFocus
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </Form>
    </Screen>
  );
}
