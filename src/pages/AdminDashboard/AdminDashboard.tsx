import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudents } from "../../lib/adminApi";
import type { Student } from "../../types/admin";
import { Subtitle, Title } from "../../components/ui/Screen";
import {
  ErrorMessage,
  Group,
  GroupLabel,
  List,
  ListItem,
  Meta,
  Name,
  NameGroup,
  Points,
} from "./AdminDashboard.styles";

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents()
      .then(setStudents)
      .catch(() => setError("Could not load students."));
  }, []);

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
      <Title>Students</Title>
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
