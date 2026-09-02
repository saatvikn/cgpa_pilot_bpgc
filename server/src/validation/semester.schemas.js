import { z } from "zod";

// Shared semester field rules.
const semesterNameSchema = z
    .string()
    .trim()
    .min(1, "Semester name is required")
    .max(100, "Semester name must be 100 characters or fewer");

const semesterOrderSchema = z
    .number()
    .int("Semester order must be a whole number")
    .positive("Semester order must be greater than zero");

export const createSemesterSchema = z.object({
    name: semesterNameSchema,
    semesterOrder: semesterOrderSchema,
});

export const updateSemesterSchema = z
    .object({
        name: semesterNameSchema.optional(),
        semesterOrder: semesterOrderSchema.optional(),
    })
    .refine(
        (data) =>
            data.name !== undefined ||
            data.semesterOrder !== undefined,
        {
            message:
                "Provide a semester name or semester order",
        }
    );

export const semesterIdSchema = z
    .string()
    .uuid("Invalid semester ID");