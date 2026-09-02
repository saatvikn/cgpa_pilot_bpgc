import test from "node:test";
import assert from "node:assert/strict";

import { calculateSgpa } from "../src/utils/gpa.js";

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
