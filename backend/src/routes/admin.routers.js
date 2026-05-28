import express from "express";
import {
  getAdminEmployees,
  updateEmployeeSalary,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.post("/employees", getAdminEmployees);
router.post("/employees/salary", updateEmployeeSalary);

export default router;
