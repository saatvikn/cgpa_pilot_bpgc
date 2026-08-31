import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {
    AUTH_COOKIE_OPTIONS,
    JWT_SECRET,
    TOKEN_COOKIE_NAME,
    TOKEN_LIFETIME_MS,
} from "../config/auth.js";
import {
    loginSchema,
    registerSchema,
} from "../validation/auth.schemas.js";

function setAuthCookie(response, userId) {
    const token = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    // Store the JWT in an HTTP-only cookie.
    response.cookie(TOKEN_COOKIE_NAME, token, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: TOKEN_LIFETIME_MS,
    });
}

function clearAuthCookie(response) {
    response.clearCookie(
        TOKEN_COOKIE_NAME,
        AUTH_COOKIE_OPTIONS
    );
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

        setAuthCookie(response, user.id);

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

export async function loginUser(request, response) {
    const validationResult = loginSchema.safeParse(request.body);

    if (!validationResult.success) {
        return response.status(400).json({
            error: validationResult.error.issues[0].message,
        });
    }

    const email = validationResult.data.email.toLowerCase();
    const { password } = validationResult.data;

    try {
        // Include the hash only for internal password comparison.
        const userResult = await pool.query(
            `SELECT id, email, password_hash, created_at
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (userResult.rowCount === 0) {
            return response.status(401).json({
                error: "Invalid email or password",
            });
        }

        const userRecord = userResult.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            userRecord.password_hash
        );

        if (!passwordMatches) {
            return response.status(401).json({
                error: "Invalid email or password",
            });
        }

        setAuthCookie(response, userRecord.id);

        return response.status(200).json({
            user: {
                id: userRecord.id,
                email: userRecord.email,
                created_at: userRecord.created_at,
            },
        });
    } catch (error) {
        console.error("User login failed:", error.message);

        return response.status(500).json({
            error: "Could not log in",
        });
    }
}

export function logoutUser(request, response) {
    // Expire the authentication cookie.
    clearAuthCookie(response);

    return response.status(200).json({
        message: "Logged out",
    });
}

export async function getCurrentUser(request, response) {
    try {
        const userResult = await pool.query(
            `SELECT id, email, created_at
             FROM users
             WHERE id = $1`,
            [request.userId]
        );

        if (userResult.rowCount === 0) {
            clearAuthCookie(response);

            return response.status(401).json({
                error: "Invalid or expired authentication",
            });
        }

        return response.status(200).json({
            user: userResult.rows[0],
        });
    } catch (error) {
        console.error(
            "Current user lookup failed:",
            error.message
        );

        return response.status(500).json({
            error: "Could not get current user",
        });
    }
}