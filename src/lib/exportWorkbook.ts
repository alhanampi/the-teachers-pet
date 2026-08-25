import type { Workbook } from "exceljs";
import type { AttemptRecord, Student } from "../types/admin";
import { summarizeByGroup } from "./attemptSummary";

const MAX_SHEET_NAME_LENGTH = 31;
const INVALID_SHEET_NAME_CHARS = /[\\/?*[\]:]/g;
const PERCENT_FORMAT = "0.0%";
const DATE_FORMAT = "yyyy-mm-dd hh:mm";
const HISTORY_COLUMN_WIDTHS = [18, 10, 12, 14, 40, 10];

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "student"
  );
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeSheetName(rawName: string, usedNames: Set<string>): string {
  const base =
    rawName.replace(INVALID_SHEET_NAME_CHARS, " ").trim().slice(0, MAX_SHEET_NAME_LENGTH) ||
    "Student";
  let candidate = base;
  let suffix = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    const suffixText = ` (${suffix})`;
    candidate = base.slice(0, MAX_SHEET_NAME_LENGTH - suffixText.length) + suffixText;
    suffix += 1;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function triggerDownload(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addStudentSheet(
  workbook: Workbook,
  sheetName: string,
  student: Student,
  attempts: AttemptRecord[],
): void {
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = HISTORY_COLUMN_WIDTHS.map((width) => ({ width }));

  const titleRow = worksheet.addRow([`${student.name}'s progress`]);
  titleRow.font = { bold: true, size: 14 };
  worksheet.mergeCells(titleRow.number, 1, titleRow.number, HISTORY_COLUMN_WIDTHS.length);

  const totalCorrect = attempts.filter((attempt) => attempt.correct).length;
  worksheet.addRow(["Points", "Exercises attempted", "Correct", "Accuracy"]).font = {
    bold: true,
  };
  const totalsRow = worksheet.addRow([
    student.points,
    attempts.length,
    totalCorrect,
    attempts.length > 0 ? totalCorrect / attempts.length : 0,
  ]);
  totalsRow.getCell(4).numFmt = PERCENT_FORMAT;

  worksheet.addRow([]);

  const summary = summarizeByGroup(attempts);
  if (summary.length > 0) {
    worksheet.addRow(["By level & difficulty"]).font = { bold: true };
    worksheet.addRow(["Level & difficulty", "Correct", "Total", "Accuracy"]).font = {
      bold: true,
    };
    for (const group of summary) {
      const row = worksheet.addRow([group.label, group.correct, group.total, group.accuracy]);
      row.getCell(4).numFmt = PERCENT_FORMAT;
    }
    worksheet.addRow([]);
  }

  worksheet.addRow(["Attempt history"]).font = { bold: true };
  const historyHeaderRow = worksheet.addRow([
    "Date",
    "Level",
    "Difficulty",
    "Type",
    "Prompt",
    "Correct",
  ]);
  historyHeaderRow.font = { bold: true };

  if (attempts.length === 0) {
    worksheet.addRow(["No attempts yet."]);
  } else {
    const sortedAttempts = [...attempts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    for (const attempt of sortedAttempts) {
      const row = worksheet.addRow([
        new Date(attempt.createdAt),
        attempt.level,
        attempt.difficulty,
        attempt.type ?? "",
        attempt.prompt ?? attempt.exerciseId,
        attempt.correct ? "Yes" : "No",
      ]);
      row.getCell(1).numFmt = DATE_FORMAT;
    }
  }

  worksheet.views = [{ state: "frozen", ySplit: historyHeaderRow.number }];
}

function addStudentsOverviewSheet(
  workbook: Workbook,
  students: Student[],
  attemptsByStudentId: Map<string, AttemptRecord[]>,
): void {
  const worksheet = workbook.addWorksheet("Students");
  worksheet.columns = [
    { header: "Student", key: "name", width: 28 },
    { header: "Points", key: "points", width: 10 },
    { header: "Exercises", key: "exercises", width: 12 },
    { header: "Correct", key: "correct", width: 10 },
    { header: "Accuracy", key: "accuracy", width: 12 },
  ];
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  let totalPoints = 0;
  let totalExercises = 0;
  let totalCorrect = 0;

  for (const student of students) {
    const attempts = attemptsByStudentId.get(student.id) ?? [];
    const correct = attempts.filter((attempt) => attempt.correct).length;
    totalPoints += student.points;
    totalExercises += attempts.length;
    totalCorrect += correct;
    const row = worksheet.addRow({
      name: student.name,
      points: student.points,
      exercises: attempts.length,
      correct,
      accuracy: attempts.length > 0 ? correct / attempts.length : 0,
    });
    row.getCell("accuracy").numFmt = PERCENT_FORMAT;
  }

  worksheet.addRow({});
  const totalsRow = worksheet.addRow({
    name: "Class totals",
    points: totalPoints,
    exercises: totalExercises,
    correct: totalCorrect,
    accuracy: totalExercises > 0 ? totalCorrect / totalExercises : 0,
  });
  totalsRow.font = { bold: true };
  totalsRow.getCell("accuracy").numFmt = PERCENT_FORMAT;
}

function addClassSummarySheet(workbook: Workbook, allAttempts: AttemptRecord[]): void {
  const worksheet = workbook.addWorksheet("Class summary");
  worksheet.columns = [
    { header: "Level & difficulty", key: "label", width: 22 },
    { header: "Correct", key: "correct", width: 12 },
    { header: "Total", key: "total", width: 12 },
    { header: "Accuracy", key: "accuracy", width: 12 },
  ];
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const group of summarizeByGroup(allAttempts)) {
    const row = worksheet.addRow({
      label: group.label,
      correct: group.correct,
      total: group.total,
      accuracy: group.accuracy,
    });
    row.getCell("accuracy").numFmt = PERCENT_FORMAT;
  }
}

export async function exportStudentWorkbook(
  student: Student,
  attempts: AttemptRecord[],
): Promise<void> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  addStudentSheet(workbook, safeSheetName(student.name, new Set()), student, attempts);
  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, `${slugify(student.name)}-progress-${isoDate()}.xlsx`);
}

export async function exportAllStudentsWorkbook(
  students: Student[],
  attemptsByStudentId: Map<string, AttemptRecord[]>,
): Promise<void> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();

  addStudentsOverviewSheet(workbook, students, attemptsByStudentId);
  const allAttempts = students.flatMap((student) => attemptsByStudentId.get(student.id) ?? []);
  addClassSummarySheet(workbook, allAttempts);

  const usedSheetNames = new Set<string>(["students", "class summary"]);
  for (const student of students) {
    addStudentSheet(
      workbook,
      safeSheetName(student.name, usedSheetNames),
      student,
      attemptsByStudentId.get(student.id) ?? [],
    );
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, `my-students-progress-${isoDate()}.xlsx`);
}
