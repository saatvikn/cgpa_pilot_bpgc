import { rateLimit } from "express-rate-limit";

// Limit repeated authentication attempts.
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Try again later.",
    },
});