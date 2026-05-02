import express from "express";
import {
  getAllTickets,
  getTicketById,
  bookTicket,
  cancelTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.post("/", bookTicket);
router.put("/:id/cancel", cancelTicket);

export default router;