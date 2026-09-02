import pool from "../config/db.js";
import {
    addSemesterCourseSchema,
    semesterCourseIdSchema,
    updateSemesterCourseGradeSchema,
} from "../validation/semester-course.schemas.js";
import { semesterIdSchema } from "../validation/semester.schemas.js";
import { calculateSgpa } from "../utils/gpa.js";

export async function getSemesterCourses(request, response, next) {
    const idValidation = semesterIdSchema.safeParse(
        request.params.id
    );

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const semesterId = idValidation.data;

    try {
        // Confirm that this semester belongs to the user.
        const semesterResult = await pool.query(
            `SELECT id
             FROM semesters
             WHERE id = $1
               AND user_id = $2`,
            [semesterId, request.userId]
        );

        if (semesterResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester not found",
            });
        }

        // Join selections with the master course catalogue.
        const courseResult = await pool.query(
            `SELECT
                sc.id,
                c.id AS "courseId",
                c.course_code AS "courseCode",
                c.course_name AS "courseName",
                c.credits,
                c.department,
                sc.grade
             FROM semester_courses sc
             JOIN courses c
               ON c.id = sc.course_id
             WHERE sc.semester_id = $1
             ORDER BY c.course_code ASC`,
            [semesterId]
        );

        // Calculate the summary from the selected courses.
        const sgpaSummary = calculateSgpa(courseResult.rows);

        return response.status(200).json({
            semesterCourses: courseResult.rows,
            sgpaSummary,
        });
    } catch (error) {
        return next(error);
    }
}

export async function addCourseToSemester(request, response, next) {
    const idValidation = semesterIdSchema.safeParse(
        request.params.id
    );

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const bodyValidation =
        addSemesterCourseSchema.safeParse(
            request.body
        );

    if (!bodyValidation.success) {
        return response.status(400).json({
            error:
                bodyValidation.error.issues[0].message,
        });
    }

    const semesterId = idValidation.data;
    const { courseId } = bodyValidation.data;

    try {
        // Only the semester owner may add courses.
        const semesterResult = await pool.query(
            `SELECT id
             FROM semesters
             WHERE id = $1
               AND user_id = $2`,
            [semesterId, request.userId]
        );

        if (semesterResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester not found",
            });
        }

        const courseResult = await pool.query(
            `SELECT
                id AS "courseId",
                course_code AS "courseCode",
                course_name AS "courseName",
                credits,
                department
             FROM courses
             WHERE id = $1`,
            [courseId]
        );

        if (courseResult.rowCount === 0) {
            return response.status(404).json({
                error: "Course not found",
            });
        }

        const insertResult = await pool.query(
            `INSERT INTO semester_courses (
                semester_id,
                course_id
             )
             VALUES ($1, $2)
             RETURNING
                id,
                grade`,
            [semesterId, courseId]
        );

        return response.status(201).json({
            semesterCourse: {
                id: insertResult.rows[0].id,
                ...courseResult.rows[0],
                grade: insertResult.rows[0].grade,
            },
        });
    } catch (error) {
        if (error.code === "23505") {
            return response.status(409).json({
                error:
                    "Course is already in this semester",
            });
        }

        return next(error);
    }
}

export async function updateSemesterCourseGrade(request, response, next) {
    const idValidation = semesterCourseIdSchema.safeParse(
        request.params.semesterCourseId
    );

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const bodyValidation =
        updateSemesterCourseGradeSchema.safeParse(
            request.body
        );

    if (!bodyValidation.success) {
        return response.status(400).json({
            error:
                bodyValidation.error.issues[0].message,
        });
    }

    const semesterCourseId = idValidation.data;
    const { grade } = bodyValidation.data;

    try {
        // Update only through a semester owned by this user.
        const updateResult = await pool.query(
            `UPDATE semester_courses AS sc
             SET
                grade = $1,
                updated_at = NOW()
             FROM semesters AS s
             WHERE sc.id = $2
               AND sc.semester_id = s.id
               AND s.user_id = $3
             RETURNING
                sc.id,
                sc.grade,
                sc.updated_at AS "updatedAt"`,
            [grade, semesterCourseId, request.userId]
        );

        if (updateResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester course not found",
            });
        }

        return response.status(200).json({
            semesterCourse: updateResult.rows[0],
        });
    } catch (error) {
        if (error.code === "23514") {
            return response.status(400).json({
                error: "Invalid grade",
            });
        }

        return next(error);
    }
}

export async function deleteSemesterCourse(request, response, next) {
    const idValidation = semesterCourseIdSchema.safeParse(
        request.params.semesterCourseId
    );

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const semesterCourseId = idValidation.data;

    try {
        // Delete only through a semester owned by this user.
        const deleteResult = await pool.query(
            `DELETE FROM semester_courses AS sc
             USING semesters AS s
             WHERE sc.id = $1
               AND sc.semester_id = s.id
               AND s.user_id = $2
             RETURNING sc.id`,
            [semesterCourseId, request.userId]
        );

        if (deleteResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester course not found",
            });
        }

        return response.status(200).json({
            message: "Course removed from semester",
        });
    } catch (error) {
        return next(error);
    }
}
