import { useEffect, useState } from "react";
import { useStudent } from "../../state/StudentContext";
import { fetchInstitutes, fetchTeachers } from "../../lib/studentApi";
import type { Institute, Teacher } from "../../types/institute";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Screen, Subtitle, Title } from "../../components/ui/Screen";
import { ErrorMessage, Form } from "./Onboarding.styles";

export function Onboarding() {
  const { name, completeOnboarding } = useStudent();
  const [institutes, setInstitutes] = useState<Institute[] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [instituteId, setInstituteId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstitutes()
      .then(setInstitutes)
      .catch(() => setError("Could not load institutes."));
  }, []);

  useEffect(() => {
    if (!instituteId) return;
    fetchTeachers(instituteId)
      .then(setTeachers)
      .catch(() => setError("Could not load teachers."));
  }, [instituteId]);

  const handleInstituteChange = (value: string) => {
    setInstituteId(value);
    setTeacherId("");
    setTeachers(null);
  };

  const handleSubmit = async () => {
    if (!teacherId) return;
    setSubmitting(true);
    setError(null);
    try {
      await completeOnboarding(teacherId);
    } catch {
      setError("Could not save your teacher. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Title>Hi, {name}! 👋</Title>
      <Subtitle>Which institute and teacher are you with?</Subtitle>
      <Form>
        <Select
          label="Institute"
          value={instituteId}
          onChange={(event) => handleInstituteChange(event.target.value)}
          options={[
            { value: "", label: "Choose your institute" },
            ...(institutes ?? []).map((institute) => ({
              value: institute.id,
              label: institute.name,
            })),
          ]}
        />
        <Select
          label="Teacher"
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          disabled={!instituteId}
          options={[
            { value: "", label: "Choose your teacher" },
            ...(teachers ?? []).map((teacher) => ({
              value: teacher.id,
              label: teacher.displayName,
            })),
          ]}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="button" disabled={!teacherId || submitting} onClick={handleSubmit}>
          {submitting ? "Saving..." : "Continue"}
        </Button>
      </Form>
    </Screen>
  );
}
