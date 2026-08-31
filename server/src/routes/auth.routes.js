import { Router } from "express";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

// New user registration.
authRouter.post("/register", registerUser);

// Existing user login.
authRouter.post("/login", loginUser);

// Clear the authentication cookie.
authRouter.post("/logout", logoutUser);

// Return the authenticated user.
authRouter.get("/me", getCurrentUser);

export default authRouter;