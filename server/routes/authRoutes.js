import express from "express";
import {
  registerUser,
  loginUser,
  getAuthStatus,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAuthStatus);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;