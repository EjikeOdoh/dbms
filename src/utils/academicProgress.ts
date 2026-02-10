import { Grade } from "src/grades/entities/grade.entity";

export const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};


export function calculateTermAverage(grade: Grade): number | null {
  const subjects = [
    grade.english,
    grade.math,
    grade.chemistry,
    grade.physics,
    grade.biology,
    grade.economics,
    grade.government,
    grade.commerce,
    grade.literature,
    grade.accounting,
  ].filter(Boolean);

  if (subjects.length === 0) return null;

  const total = subjects.reduce(
    (sum, g) => sum + GRADE_POINTS[g],
    0,
  );

  return total / subjects.length;
}
