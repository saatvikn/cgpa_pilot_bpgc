import "dotenv/config";
import pool from "../src/config/db.js";

async function testDatabaseConnection() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        console.log("Database connection successful.");
        console.log("PostgreSQL time:", result.rows[0].current_time);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exitCode = 1;
    } finally {
        // Standalone scripts must close the pool before exiting.
        await pool.end();
    }
}

testDatabaseConnection();