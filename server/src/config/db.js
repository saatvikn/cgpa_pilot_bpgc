import { readFileSync } from "node:fs";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
}

// Load Supabase's trusted certificate authority.
const supabaseCertificate = readFileSync(
    new URL("../../certs/supabase_ca.crt", import.meta.url),
    "utf8"
);

// Reuse verified SSL connections to PostgreSQL.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        ca: supabaseCertificate,
        rejectUnauthorized: true,
    },
    connectionTimeoutMillis: 30000,
});

export default pool;