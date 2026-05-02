import Event from "../models/Event.js";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email role");

    res.status(200).json({
      message: "All events fetched successfully",
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching events",
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate(
      "organizer",
      "name email role"
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching event",
      error: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      location,
      date,
      capacity,
      organizer,
      status,
      visibility,
    } = req.body;

    if (
      !title ||
      !category ||
      !description ||
      !location ||
      !date ||
      !capacity ||
      !organizer
    ) {
      return res.status(400).json({
        message: "All required event fields must be provided",
      });
    }

    const newEvent = await Event.create({
      title,
      category,
      description,
      location,
      date,
      capacity,
      organizer,
      status,
      visibility,
    });

    const populatedEvent = await Event.findById(newEvent._id).populate(
      "organizer",
      "name email role"
    );

    res.status(201).json({
      message: "Event created successfully",
      event: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating event",
      error: error.message,
    });
  }
};