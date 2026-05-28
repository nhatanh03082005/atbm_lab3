import {
  loginAdmin,
  loginEmployee,
  registerEmployee,
} from "../controllers/auth.controllers.js";
import express from "express";

const router = express.Router();

router.post("/login", loginEmployee);
router.post("/login-admin", loginAdmin);
router.post("/register", registerEmployee);

export default router;
