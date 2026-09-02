import { z } from "zod";

export const addSemesterCourseSchema = z.object({
    courseId: z
        .string()
        .uuid("Invalid course ID"),
});

export const semesterCourseIdSchema = z
    .string()
    .uuid("Invalid semester course ID");
