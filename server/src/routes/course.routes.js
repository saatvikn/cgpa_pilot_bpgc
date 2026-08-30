import { Router } from "express";
import { getCourses } from "../controllers/course.controller.js";

const courseRouter = Router();

// Course catalogue endpoints.
courseRouter.get("/", getCourses);

export default courseRouter;