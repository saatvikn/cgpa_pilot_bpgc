import pool from "../config/db.js";

export async function getCourses(request, response, next) {
    try {
        const search = String(request.query.search || "").trim();
        const searchPattern = `%${search}%`;

        // Search values are passed separately from the SQL text.
        const result = await pool.query(
            `
        SELECT
          id,
          course_code AS "courseCode",
          course_name AS "courseName",
          credits,
          department
        FROM courses
        WHERE
          course_code ILIKE $1
          OR course_name ILIKE $1
        ORDER BY course_code
        LIMIT 50
      `,
            [searchPattern]
        );

        return response.status(200).json({
            courses: result.rows,
        });
    } catch (error) {
        return next(error);
    }
}
