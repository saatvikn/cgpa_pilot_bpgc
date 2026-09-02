import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import courseRouter from "./routes/course.routes.js";
import semesterRouter from "./routes/semester.routes.js";

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

// CORS middleware.
app.use(
    cors({
        origin: clientUrl,
        credentials: true,
    })
);

// JSON body middleware.
app.use(express.json());

// Cookie parsing middleware.
app.use(cookieParser());

app.get("/api/health", (request, response) => {
    response.status(200).json({
        status: "ok",
    });
});

// Authentication API.
app.use("/api/auth", authRouter);

// Course catalogue API.
app.use("/api/courses", courseRouter);

// User semester API.
app.use("/api/semesters", semesterRouter);

export default app;