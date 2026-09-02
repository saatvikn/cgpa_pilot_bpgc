import { Router } from "express";
import {
    createSemester,
    deleteSemester,
    getSemesterById,
    getSemesters,
    updateSemester,
} from "../controllers/semester.controller.js";
import { getSemesterCourses } from "../controllers/semester-course.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const semesterRouter = Router();

// Protect every semester route below this middleware.
semesterRouter.use(authenticateUser);

semesterRouter.get("/", getSemesters);
semesterRouter.post("/", createSemester);
semesterRouter.get("/:id/courses", getSemesterCourses);
semesterRouter.get("/:id", getSemesterById);
semesterRouter.patch("/:id", updateSemester);
semesterRouter.delete("/:id", deleteSemester);

export default semesterRouter;
