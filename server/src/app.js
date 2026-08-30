import express from "express";
import cors from "cors";
import courseRouter from "./routes/course.routes.js";

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

// CORS middleware.
app.use(
    cors({
        origin: clientUrl,
    })
);

app.get("/api/health", (request, response) => {
    response.status(200).json({
        status: "ok",
    });
});

// Course catalogue API.
app.use("/api/courses", courseRouter);

export default app;