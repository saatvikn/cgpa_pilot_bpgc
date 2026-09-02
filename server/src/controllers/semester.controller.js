import pool from "../config/db.js";
import {
    createSemesterSchema,
    semesterIdSchema,
    updateSemesterSchema,
} from "../validation/semester.schemas.js";
import { calculateCgpa } from "../utils/gpa.js";

export async function getSemesters(request, response, next) {
    try {
        // Return only the authenticated user's semesters.
        const semesterResult = await pool.query(
            `SELECT
                id,
                name,
                semester_order AS "semesterOrder",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM semesters
             WHERE user_id = $1
             ORDER BY semester_order ASC`,
            [request.userId]
        );

        // Load the courses needed for SGPA and CGPA calculations.
        const courseResult = await pool.query(
            `SELECT
                sc.semester_id AS "semesterId",
                c.credits,
                sc.grade
             FROM semester_courses sc
             JOIN semesters s
               ON s.id = sc.semester_id
             JOIN courses c
               ON c.id = sc.course_id
             WHERE s.user_id = $1`,
            [request.userId]
        );

        const coursesBySemester = new Map(
            semesterResult.rows.map((semester) => [semester.id, []])
        );

        for (const course of courseResult.rows) {
            const semesterCourses = coursesBySemester.get(course.semesterId);

            if (semesterCourses) {
                semesterCourses.push(course);
            }
        }

        const calculation = calculateCgpa(
            semesterResult.rows.map((semester) => ({
                id: semester.id,
                name: semester.name,
                semesterOrder: semester.semesterOrder,
                courses: coursesBySemester.get(semester.id),
            }))
        );

        const semesters = semesterResult.rows.map(
            (semester, index) => {
                const summary = calculation.semesters[index];

                return {
                    ...semester,
                    sgpa: summary.sgpa,
                    gradedCredits: summary.gradedCredits,
                    gradedCourseCount: summary.gradedCourseCount,
                    totalCourseCount: summary.totalCourseCount,
                };
            }
        );

        return response.status(200).json({
            semesters,
            cgpaSummary: {
                cgpa: calculation.cgpa,
                gradedCredits: calculation.gradedCredits,
                gradedCourseCount: calculation.gradedCourseCount,
                totalCourseCount: calculation.totalCourseCount,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function createSemester(request, response, next) {
    const validationResult = createSemesterSchema.safeParse(request.body);

    if (!validationResult.success) {
        return response.status(400).json({
            error: validationResult.error.issues[0].message,
        });
    }

    const { name, semesterOrder } = validationResult.data;

    try {
        // The authenticated user owns the new semester.
        const semesterResult = await pool.query(
            `INSERT INTO semesters (
                user_id,
                name,
                semester_order
             )
             VALUES ($1, $2, $3)
             RETURNING
                id,
                name,
                semester_order AS "semesterOrder",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [request.userId, name, semesterOrder]
        );

        return response.status(201).json({
            semester: semesterResult.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return response.status(409).json({
                error: "A semester with this order already exists",
            });
        }

        return next(error);
    }
}

export async function getSemesterById(request, response, next) {
    const idValidation = semesterIdSchema.safeParse(request.params.id);

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const semesterId = idValidation.data;

    try {
        // Match both the semester ID and its owner.
        const semesterResult = await pool.query(
            `SELECT
                id,
                name,
                semester_order AS "semesterOrder",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
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

        return response.status(200).json({
            semester: semesterResult.rows[0],
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateSemester(request, response, next) {
    const idValidation = semesterIdSchema.safeParse(request.params.id);

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const bodyValidation = updateSemesterSchema.safeParse(request.body);

    if (!bodyValidation.success) {
        return response.status(400).json({
            error: bodyValidation.error.issues[0].message,
        });
    }

    const semesterId = idValidation.data;
    const name = bodyValidation.data.name ?? null;
    const semesterOrder = bodyValidation.data.semesterOrder ?? null;

    try {
        // Update only a semester owned by this user.
        const semesterResult = await pool.query(
            `UPDATE semesters
             SET
                name = COALESCE($1, name),
                semester_order = COALESCE(
                    $2,
                    semester_order
                ),
                updated_at = NOW()
             WHERE id = $3
               AND user_id = $4
             RETURNING
                id,
                name,
                semester_order AS "semesterOrder",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [
                name,
                semesterOrder,
                semesterId,
                request.userId,
            ]
        );

        if (semesterResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester not found",
            });
        }

        return response.status(200).json({
            semester: semesterResult.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return response.status(409).json({
                error: "A semester with this order already exists",
            });
        }

        return next(error);
    }
}

export async function deleteSemester(request, response, next) {
    const idValidation = semesterIdSchema.safeParse(request.params.id);

    if (!idValidation.success) {
        return response.status(400).json({
            error: idValidation.error.issues[0].message,
        });
    }

    const semesterId = idValidation.data;

    try {
        // Delete only a semester owned by this user.
        const deleteResult = await pool.query(
            `DELETE FROM semesters
             WHERE id = $1
               AND user_id = $2`,
            [semesterId, request.userId]
        );

        if (deleteResult.rowCount === 0) {
            return response.status(404).json({
                error: "Semester not found",
            });
        }

        return response.status(200).json({
            message: "Semester deleted",
        });
    } catch (error) {
        return next(error);
    }
}
