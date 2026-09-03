import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";

const authRouter = Router();

// New user registration.
authRouter.post("/register", authRateLimiter, registerUser);

// Existing user login.
authRouter.post("/login", authRateLimiter, loginUser);

// Clear the authentication cookie.
authRouter.post("/logout", logoutUser);

// Return the authenticated user.
authRouter.get("/me", authenticateUser, getCurrentUser);

export default authRouter;