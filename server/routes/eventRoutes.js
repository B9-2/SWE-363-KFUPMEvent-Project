import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", createEvent);

export default router;