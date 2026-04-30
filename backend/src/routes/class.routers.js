import {
  getAllClasses,
  getStudentsByClass,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/class.controllers.js";
import express from "express";

const router = express.Router();

router.get("/", getAllClasses);
router.get("/:id", getStudentsByClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
