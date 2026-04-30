import express from "express";
import {
  getManagedClasses,
  getStudentsByClass,
  getCourses,
  saveScore,
  checkScoreExists,
  verifyEmployeePassword,
  getScoresByStudent,
} from "../controllers/score.controllers.js";

const router = express.Router();

router.get("/classes", getManagedClasses);
router.get("/students", getStudentsByClass);
router.get("/courses", getCourses);
router.get("/exists", checkScoreExists);
router.post("/verify", verifyEmployeePassword);
router.post("/by-student", getScoresByStudent);
router.post("/", saveScore);

export default router;
