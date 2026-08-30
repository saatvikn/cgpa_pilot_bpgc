import "dotenv/config";
import { readFile } from "node:fs/promises";
import pool from "../src/config/db.js";

async function runMigration() {
    try {
        // Read the schema from its version-controlled SQL file.
        const migrationPath = new URL(
            "../sql/001_initial_schema.sql",
            import.meta.url
        );

        const migrationSql = await readFile(migrationPath, "utf8");

        await pool.query(migrationSql);

        console.log("Initial database schema created.");
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        // Close the pool when this one-time script finishes.
        await pool.end();
    }
}

runMigration();