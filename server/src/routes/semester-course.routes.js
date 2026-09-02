import { Router } from "express";
import {
    deleteSemesterCourse,
    updateSemesterCourseGrade,
} from "../controllers/semester-course.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const semesterCourseRouter = Router();

// Protect every selected-course route.
semesterCourseRouter.use(authenticateUser);

semesterCourseRouter.patch("/:semesterCourseId", updateSemesterCourseGrade);

semesterCourseRouter.delete("/:semesterCourseId", deleteSemesterCourse);

export default semesterCourseRouter;
