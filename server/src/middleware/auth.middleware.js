import jwt from "jsonwebtoken";
import {
    AUTH_COOKIE_OPTIONS,
    JWT_SECRET,
    TOKEN_COOKIE_NAME,
} from "../config/auth.js";

export function authenticateUser(
    request,
    response,
    next
) {
    const token = request.cookies[TOKEN_COOKIE_NAME];

    if (!token) {
        return response.status(401).json({
            error: "Authentication required",
        });
    }

    try {
        // Verify the cookie token before trusting its user ID.
        const tokenPayload = jwt.verify(
            token,
            JWT_SECRET
        );

        if (!tokenPayload.userId) {
            throw new Error(
                "Token does not contain a user ID"
            );
        }

        request.userId = tokenPayload.userId;

        return next();
    } catch {
        response.clearCookie(
            TOKEN_COOKIE_NAME,
            AUTH_COOKIE_OPTIONS
        );

        return response.status(401).json({
            error: "Invalid or expired authentication",
        });
    }
}