export const getAdminStatus = (req, res) => {
  res.status(200).json({
    message: "Admin controller is working",
  });
};

export const getApplications = (req, res) => {
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
};

export const getUsers = (req, res) => {
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
};

export const getAnalytics = (req, res) => {
  res.status(200).json({
    message: "Analytics fetched successfully",
    stats: {
      totalEvents: 24,
      approvedEvents: 18,
      totalBookings: 356,
      attendanceRate: "82%",
    },
  });
};