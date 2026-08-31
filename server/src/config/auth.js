export const TOKEN_COOKIE_NAME = "auth_token";
export const TOKEN_LIFETIME_MS =
    7 * 24 * 60 * 60 * 1000;

export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
};

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error(
        "JWT_SECRET must contain at least 32 characters"
    );
}