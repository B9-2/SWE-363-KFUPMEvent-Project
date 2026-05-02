import express from "express";
import {
  getAdminStatus,
  getApplications,
  getUsers,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdminStatus);
router.get("/applications", getApplications);
router.get("/users", getUsers);
router.get("/analytics", getAnalytics);

export default router;