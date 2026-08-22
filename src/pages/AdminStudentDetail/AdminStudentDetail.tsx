import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchStudentAttempts, fetchStudents } from "../../lib/adminApi";
import { usePolling } from "../../lib/usePolling";
import { summarizeByGroup } from "../../lib/attemptSummary";
import type { AttemptRecord, Student } from "../../types/admin";
import { Subtitle, Title } from "../../components/ui/Screen";
import {
  AttemptList,
  AttemptMeta,
  AttemptPrompt,
  AttemptRow,
  BackButton,
  ErrorMessage,
  SectionTitle,
  SummaryList,
  SummaryRow,
} from "./AdminStudentDetail.styles";

const WEAK_THRESHOLD = 0.7;
const POLL_INTERVAL_MS = 10000;

export function AdminStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!studentId) return;
    Promise.all([fetchStudents(), fetchStudentAttempts(studentId)])
      .then(([students, studentAttempts]) => {
        setStudent(students.find((candidate) => candidate.id === studentId) ?? null);
        setAttempts(studentAttempts);
      })
      .catch(() => setError("Could not load this student's history."));
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePolling(loadData, POLL_INTERVAL_MS);

  const summary = useMemo(() => (attempts ? summarizeByGroup(attempts) : []), [attempts]);

  return (
    <div>
      <BackButton type="button" onClick={() => navigate("/admin/dashboard")}>
        ← Back to students
      </BackButton>
      <Title>{student?.name ?? "Student"}</Title>
      {student && <Subtitle>{student.points} points</Subtitle>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {summary.length > 0 && (
        <>
          <SectionTitle>Where to improve</SectionTitle>
          <SummaryList>
            {summary.map((group) => (
              <SummaryRow key={group.key} $weak={group.accuracy < WEAK_THRESHOLD}>
                <span>{group.label}</span>
                <span>
                  {group.correct}/{group.total} ({Math.round(group.accuracy * 100)}%)
                </span>
              </SummaryRow>
            ))}
          </SummaryList>
        </>
      )}

      <SectionTitle>Attempt history</SectionTitle>
      {attempts && attempts.length === 0 && <Subtitle>No attempts yet.</Subtitle>}
      <AttemptList>
        {attempts?.map((attempt) => (
          <AttemptRow key={attempt.id} $correct={attempt.correct}>
            <AttemptPrompt>{attempt.prompt ?? attempt.exerciseId}</AttemptPrompt>
            <AttemptMeta>
              {attempt.correct ? "✅" : "❌"} {attempt.level} {attempt.difficulty}
            </AttemptMeta>
          </AttemptRow>
        ))}
      </AttemptList>
    </div>
  );
}
