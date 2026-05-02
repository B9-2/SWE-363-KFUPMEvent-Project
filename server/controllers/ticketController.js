import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("event", "title date location")
      .populate("attendee", "name email role");

    res.status(200).json({
      message: "All tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching tickets",
      error: error.message,
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate("event", "title date location")
      .populate("attendee", "name email role");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching ticket",
      error: error.message,
    });
  }
};

export const bookTicket = async (req, res) => {
  try {
    const { event, attendee, quantity } = req.body;

    if (!event || !attendee) {
      return res.status(400).json({
        message: "Event and attendee are required",
      });
    }

    const existingEvent = await Event.findById(event);

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const newTicket = await Ticket.create({
      event,
      attendee,
      quantity: quantity || 1,
      qrCode: `QR-${Date.now()}`,
    });

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate("event", "title date location")
      .populate("attendee", "name email role");

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while booking ticket",
      error: error.message,
    });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    )
      .populate("event", "title date location")
      .populate("attendee", "name email role");

    if (!updatedTicket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket cancelled successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while cancelling ticket",
      error: error.message,
    });
  }
};