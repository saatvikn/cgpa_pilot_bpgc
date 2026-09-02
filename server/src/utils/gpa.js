export const GRADE_POINTS = Object.freeze({
  A: 10,
  "A-": 9,
  B: 8,
  "B-": 7,
  C: 6,
  "C-": 5,
  D: 4,
  E: 2,
});

export function calculateSgpa(courses) {
  let weightedPoints = 0;
  let gradedCredits = 0;
  let gradedCourseCount = 0;

  for (const course of courses) {
    // Ignore courses whose grade has not been selected
    if (course.grade === null || course.grade === undefined) {
      continue;
    }

    const gradePoint = GRADE_POINTS[course.grade];

    if (gradePoint === undefined) {
      throw new Error(`Unsupported grade: ${course.grade}`);
    }

    const credits = Number(course.credits);

    if (!Number.isFinite(credits) || credits <= 0) {
      throw new Error("Course credits must be a positive number");
    }

    weightedPoints += credits * gradePoint;
    gradedCredits += credits;
    gradedCourseCount += 1;
  }

  return {
    sgpa: gradedCredits === 0 ? null : weightedPoints / gradedCredits,
    gradedCredits,
    gradedCourseCount,
    totalCourseCount: courses.length,
  };
}

export function calculateCgpa(semesters) {
  const semesterSummaries = semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    semesterOrder: semester.semesterOrder,
    ...calculateSgpa(semester.courses),
  }));

  const allCourses = semesters.flatMap((semester) => semester.courses);
  const overallSummary = calculateSgpa(allCourses);

  return {
    cgpa: overallSummary.sgpa,
    gradedCredits: overallSummary.gradedCredits,
    gradedCourseCount: overallSummary.gradedCourseCount,
    totalCourseCount: overallSummary.totalCourseCount,
    semesters: semesterSummaries,
  };
}
