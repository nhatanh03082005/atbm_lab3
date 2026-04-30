import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controllers.js";
import express from "express";

const router = express.Router();

router.get("/", getAllStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
