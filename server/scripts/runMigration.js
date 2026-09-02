import "dotenv/config";
import { readFile } from "node:fs/promises";
import pool from "../src/config/db.js";

async function runMigration() {
    try {
        const migrationFile = process.argv[2];
        const validFileName = /^\d{3}_[a-z0-9_]+\.sql$/;

        if (!migrationFile || !validFileName.test(migrationFile)) {
            throw new Error(
                "Provide a migration file, for example: npm run migrate -- 002_indexes.sql"
            );
        }

        // Read only a valid migration from the SQL folder.
        const migrationPath = new URL(
            `../sql/${migrationFile}`,
            import.meta.url
        );

        const migrationSql = await readFile(migrationPath, "utf8");

        await pool.query(migrationSql);

        console.log(`Migration ${migrationFile} completed.`);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        // Close the pool when this one-time script finishes.
        await pool.end();
    }
}

runMigration();
