import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudentAttempts, fetchStudents } from "../../lib/adminApi";
import { usePolling } from "../../lib/usePolling";
import { exportAllStudentsWorkbook } from "../../lib/exportWorkbook";
import type { AttemptRecord, Student } from "../../types/admin";
import { Subtitle, Title } from "../../components/ui/Screen";
import { ExportButton } from "../../components/admin/ExportButton";
import {
  ErrorMessage,
  Group,
  GroupLabel,
  HeaderRow,
  List,
  ListItem,
  Meta,
  Name,
  NameGroup,
  Points,
} from "./AdminDashboard.styles";

const POLL_INTERVAL_MS = 10000;

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadStudents = useCallback(() => {
    fetchStudents()
      .then(setStudents)
      .catch(() => setError("Could not load students."));
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  usePolling(loadStudents, POLL_INTERVAL_MS);

  const handleExportAll = async (): Promise<void> => {
    if (!students || students.length === 0) return;
    const attemptsByStudentId = new Map(
      await Promise.all(
        students.map(async (student): Promise<[string, AttemptRecord[]]> => [
          student.id,
          await fetchStudentAttempts(student.id),
        ]),
      ),
    );
    await exportAllStudentsWorkbook(students, attemptsByStudentId);
  };

  const groups = useMemo(() => {
    if (!students) return [];
    const byName = new Map<string, Student[]>();
    for (const student of students) {
      const key = student.name.trim().toLowerCase();
      byName.set(key, [...(byName.get(key) ?? []), student]);
    }
    return Array.from(byName.values());
  }, [students]);

  return (
    <div>
      <HeaderRow>
        <Title>Students</Title>
        {students && students.length > 0 && (
          <ExportButton label="Export all" onExport={handleExportAll} onError={setError} />
        )}
      </HeaderRow>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!students && !error && <Subtitle>Loading...</Subtitle>}
      {students && students.length === 0 && <Subtitle>No students yet.</Subtitle>}
      <List>
        {groups.map((group) =>
          group.length === 1 ? (
            <ListItem key={group[0].id} onClick={() => navigate(`/admin/dashboard/${group[0].id}`)}>
              <Name>{group[0].name}</Name>
              <Points>{group[0].points} pts</Points>
            </ListItem>
          ) : (
            <Group key={group[0].name.trim().toLowerCase()}>
              <GroupLabel>
                {group[0].name} · {group.length} profiles
              </GroupLabel>
              {group.map((student) => (
                <ListItem
                  key={student.id}
                  onClick={() => navigate(`/admin/dashboard/${student.id}`)}
                >
                  <NameGroup>
                    <Name>{student.name}</Name>
                    <Meta>{new Date(student.createdAt).toLocaleDateString()}</Meta>
                  </NameGroup>
                  <Points>{student.points} pts</Points>
                </ListItem>
              ))}
            </Group>
          ),
        )}
      </List>
    </div>
  );
}
