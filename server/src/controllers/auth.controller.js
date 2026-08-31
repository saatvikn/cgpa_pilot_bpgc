import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { registerSchema } from "../validation/auth.schemas.js";

const TOKEN_COOKIE_NAME = "auth_token";
const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
}

export async function registerUser(request, response) {
    const validationResult = registerSchema.safeParse(request.body);

    if (!validationResult.success) {
        return response.status(400).json({
            error: validationResult.error.issues[0].message,
        });
    }

    const email = validationResult.data.email.toLowerCase();
    const { password } = validationResult.data;

    try {
        // Check whether the email is already registered.
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rowCount > 0) {
            return response.status(409).json({
                error: "An account with this email already exists",
            });
        }

        // Hash the password before database storage.
        const passwordHash = await bcrypt.hash(password, 12);

        const insertResult = await pool.query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING id, email, created_at`,
            [email, passwordHash]
        );

        const user = insertResult.rows[0];

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Store the JWT in an HTTP-only cookie.
        response.cookie(TOKEN_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: TOKEN_LIFETIME_MS,
            path: "/",
        });

        return response.status(201).json({ user });
    } catch (error) {
        // PostgreSQL unique-constraint error.
        if (error.code === "23505") {
            return response.status(409).json({
                error: "An account with this email already exists",
            });
        }

        console.error("User registration failed:", error.message);

        return response.status(500).json({
            error: "Could not register user",
        });
    }
}