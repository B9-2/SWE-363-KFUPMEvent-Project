import OrganizerApplication from "../models/OrganizerApplication.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";

export const getAdminStatus = (req, res) => {
  res.status(200).json({
    message: "Admin controller is working",
  });
};

export const getApplications = async (req, res) => {
  try {
    const applications = await OrganizerApplication.find().populate(
      "applicant",
      "name email role"
    );

    res.status(200).json({
      message: "Organizer applications fetched successfully",
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching applications",
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const totalApplications = await OrganizerApplication.countDocuments();

    res.status(200).json({
      message: "Analytics fetched successfully",
      stats: {
        totalEvents,
        totalUsers,
        totalTickets,
        totalApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching analytics",
      error: error.message,
    });
  }
};