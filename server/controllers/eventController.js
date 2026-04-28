export const getAllEvents = (req, res) => {
  res.status(200).json({
    message: "All events fetched successfully",
    events: [
      {
        id: 1,
        title: "AI Workshop on Prompt Engineering",
        date: "2026-05-01",
        location: "Building 14 - Room 203",
      },
      {
        id: 2,
        title: "Cybersecurity Awareness Talk",
        date: "2026-05-03",
        location: "Main Auditorium",
      },
    ],
  });
};

export const getEventById = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    message: "Event details fetched successfully",
    event: {
      id,
      title: "AI Workshop on Prompt Engineering",
      date: "2026-05-01",
      time: "20:30",
      location: "Building 14 - Room 203",
      organizer: "Computer Science Club",
      capacity: 250,
    },
  });
};

export const createEvent = (req, res) => {
  const { title, date, location } = req.body;

  res.status(201).json({
    message: "Event created successfully",
    event: {
      title,
      date,
      location,
    },
  });
};