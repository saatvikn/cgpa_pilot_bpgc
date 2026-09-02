import pool from "../config/db.js";
import { semesterIdSchema } from "../validation/semester.schemas.js";

export async function getSemesterCourses(
    request,
    response
) {
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

        return response.status(200).json({
            semesterCourses: courseResult.rows,
        });
    } catch (error) {
        console.error(
            "Semester course list failed:",
            error.message
        );

        return response.status(500).json({
            error: "Could not get semester courses",
        });
    }
}
