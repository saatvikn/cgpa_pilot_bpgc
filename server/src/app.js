import express from "express";
import cors from "cors";

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

// CORS middleware
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

export default app;