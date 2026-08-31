import { z } from "zod";

// Registration request rules.
export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address")
        .max(254, "Email must be 254 characters or fewer"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be 72 characters or fewer"),
});