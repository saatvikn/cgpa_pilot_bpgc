import express from "express";

const app = express();

app.get("/api/health", (request, response) => {
    response.status(200).json({
        status: "ok",
    });
});

export default app;