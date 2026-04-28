import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Admin route is working",
  });
});

router.get("/applications", (req, res) => {
  res.status(200).json({
    message: "Organizer applications fetched successfully",
    applications: [
      {
        id: 1,
        organization: "Computer Science Club",
        applicant: "Ahmed Ali",
        status: "Pending",
      },
      {
        id: 2,
        organization: "IEEE Student Branch",
        applicant: "Sara Khalid",
        status: "Approved",
      },
    ],
  });
});

router.get("/users", (req, res) => {
  res.status(200).json({
    message: "Users fetched successfully",
    users: [
      {
        id: 1,
        name: "Abdulrahim",
        role: "Attendee",
        status: "Active",
      },
      {
        id: 2,
        name: "Omar",
        role: "Organizer",
        status: "Active",
      },
    ],
  });
});

router.get("/analytics", (req, res) => {
  res.status(200).json({
    message: "Analytics fetched successfully",
    stats: {
      totalEvents: 24,
      approvedEvents: 18,
      totalBookings: 356,
      attendanceRate: "82%",
    },
  });
});

export default router;