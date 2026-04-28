export const getAllTickets = (req, res) => {
  res.status(200).json({
    message: "All tickets fetched successfully",
    tickets: [
      {
        id: 1,
        eventTitle: "AI Workshop on Prompt Engineering",
        attendeeName: "Abdulrahim",
        status: "Booked",
      },
      {
        id: 2,
        eventTitle: "Cybersecurity Awareness Talk",
        attendeeName: "Omar",
        status: "Checked-in",
      },
    ],
  });
};

export const getTicketById = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    message: "Ticket fetched successfully",
    ticket: {
      id,
      eventTitle: "AI Workshop on Prompt Engineering",
      attendeeName: "Abdulrahim",
      status: "Booked",
      qrCode: "sample-qr-code-placeholder",
    },
  });
};

export const bookTicket = (req, res) => {
  const { eventId, attendeeName } = req.body;

  res.status(201).json({
    message: "Ticket booked successfully",
    ticket: {
      eventId,
      attendeeName,
      status: "Booked",
    },
  });
};

export const cancelTicket = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    message: `Ticket ${id} cancelled successfully`,
  });
};