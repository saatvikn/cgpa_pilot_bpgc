import { z } from "zod";

const VALID_GRADES = [
    "A",
    "A-",
    "B",
    "B-",
    "C",
    "C-",
    "D",
    "E",
];

const gradeSchema = z
    .string()
    .refine(
        (grade) => VALID_GRADES.includes(grade),
        "Invalid grade"
    )
    .nullable();

export const addSemesterCourseSchema = z.object({
    courseId: z
        .string()
        .uuid("Invalid course ID"),
});

export const semesterCourseIdSchema = z
    .string()
    .uuid("Invalid semester course ID");

export const updateSemesterCourseGradeSchema = z.object({
    grade: gradeSchema,
});
