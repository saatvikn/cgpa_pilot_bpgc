import "dotenv/config";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import pool from "../src/config/db.js";

async function seedCourses() {
    let client;

    try {
        const csvPath = new URL(
            "../data/bits-goa-courses.csv",
            import.meta.url
        );

        const csvText = await readFile(csvPath, "utf8");

        const courses = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        if (courses.length === 0) {
            throw new Error("The course CSV is empty");
        }

        const seenCourseCodes = new Set();

        client = await pool.connect();

        // All course updates should succeed or fail together.
        await client.query("BEGIN");

        for (const course of courses) {
            const courseCode = course.course_code?.toUpperCase();
            const courseName = course.course_name;
            const credits = Number(course.credits);
            const department = course.department;

            if (
                !courseCode ||
                !courseName ||
                !department ||
                !Number.isInteger(credits) ||
                credits <= 0
            ) {
                throw new Error(
                    `Invalid course data for ${courseCode || "unknown course"}`
                );
            }

            if (seenCourseCodes.has(courseCode)) {
                throw new Error(`Duplicate CSV course code: ${courseCode}`);
            }

            seenCourseCodes.add(courseCode);

            await client.query(
                `
          INSERT INTO courses (
            course_code,
            course_name,
            credits,
            department
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (course_code)
          DO UPDATE SET
            course_name = EXCLUDED.course_name,
            credits = EXCLUDED.credits,
            department = EXCLUDED.department
        `,
                [courseCode, courseName, credits, department]
            );
        }

        await client.query("COMMIT");

        console.log(`Seeded ${courses.length} verified courses.`);
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Course seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (client) {
            client.release();
        }

        // Close the pool when the seed process finishes.
        await pool.end();
    }
}

seedCourses();