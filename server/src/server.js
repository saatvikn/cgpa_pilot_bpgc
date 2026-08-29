import express from "express";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});