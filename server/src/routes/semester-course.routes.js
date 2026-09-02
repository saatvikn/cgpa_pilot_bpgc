import { Router } from "express";
import { deleteSemesterCourse } from "../controllers/semester-course.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const semesterCourseRouter = Router();

// Protect every selected-course route.
semesterCourseRouter.use(authenticateUser);

semesterCourseRouter.delete("/:semesterCourseId", deleteSemesterCourse);

export default semesterCourseRouter;
