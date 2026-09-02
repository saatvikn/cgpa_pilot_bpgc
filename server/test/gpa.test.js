import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateCgpa,
  calculateSgpa,
} from "../src/utils/gpa.js";

test("calculates a credit-weighted SGPA", () => {
  const result = calculateSgpa([
    { credits: "4.0", grade: "A" },
    { credits: "3.0", grade: "B" },
    { credits: "3.0", grade: "A-" },
  ]);

  assert.equal(result.sgpa, 9.1);
  assert.equal(result.gradedCredits, 10);
  assert.equal(result.gradedCourseCount, 3);
  assert.equal(result.totalCourseCount, 3);
});

test("ignores courses without a selected grade", () => {
  const result = calculateSgpa([
    { credits: "4.0", grade: "A" },
    { credits: "3.0", grade: null },
  ]);

  // Only the graded course contributes to the SGPA
  assert.equal(result.sgpa, 10);
  assert.equal(result.gradedCredits, 4);
  assert.equal(result.gradedCourseCount, 1);
  assert.equal(result.totalCourseCount, 2);
});

test("returns null when no courses are graded", () => {
  const result = calculateSgpa([
    { credits: "4.0", grade: null },
    { credits: "3.0", grade: null },
  ]);

  assert.equal(result.sgpa, null);
  assert.equal(result.gradedCredits, 0);
  assert.equal(result.gradedCourseCount, 0);
  assert.equal(result.totalCourseCount, 2);
});

test("rejects an unsupported grade", () => {
  assert.throws(
    () => calculateSgpa([{ credits: "4.0", grade: "F" }]),
    /Unsupported grade/,
  );
});

test("rejects invalid credits for a graded course", () => {
  assert.throws(
    () => calculateSgpa([{ credits: "0", grade: "A" }]),
    /positive number/,
  );
});

test("calculates a credit-weighted CGPA across semesters", () => {
  const result = calculateCgpa([
    {
      id: 1,
      name: "Semester 1",
      semesterOrder: 1,
      courses: [{ credits: "4.0", grade: "A" }],
    },
    {
      id: 2,
      name: "Semester 2",
      semesterOrder: 2,
      courses: [
        { credits: "2.0", grade: "B" },
        { credits: "3.0", grade: null },
      ],
    },
  ]);

  // Weighted CGPA is (4 × 10 + 2 × 8) ÷ 6.
  assert.equal(result.cgpa, 56 / 6);
  assert.equal(result.gradedCredits, 6);
  assert.equal(result.gradedCourseCount, 2);
  assert.equal(result.totalCourseCount, 3);
});

test("returns the SGPA summary for each semester", () => {
  const result = calculateCgpa([
    {
      id: 1,
      name: "Semester 1",
      semesterOrder: 1,
      courses: [{ credits: "4.0", grade: "A" }],
    },
    {
      id: 2,
      name: "Semester 2",
      semesterOrder: 2,
      courses: [
        { credits: "2.0", grade: "B" },
        { credits: "3.0", grade: null },
      ],
    },
  ]);

  assert.deepEqual(result.semesters[0], {
    id: 1,
    name: "Semester 1",
    semesterOrder: 1,
    sgpa: 10,
    gradedCredits: 4,
    gradedCourseCount: 1,
    totalCourseCount: 1,
  });

  assert.deepEqual(result.semesters[1], {
    id: 2,
    name: "Semester 2",
    semesterOrder: 2,
    sgpa: 8,
    gradedCredits: 2,
    gradedCourseCount: 1,
    totalCourseCount: 2,
  });
});

test("returns null CGPA when there are no semesters", () => {
  assert.deepEqual(calculateCgpa([]), {
    cgpa: null,
    gradedCredits: 0,
    gradedCourseCount: 0,
    totalCourseCount: 0,
    semesters: [],
  });
});
