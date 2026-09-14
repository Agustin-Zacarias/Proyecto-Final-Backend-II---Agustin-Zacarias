export const ticketDTO = (ticket) => {
  if (!ticket) return null;

  return {
    id: ticket._id?.toString() || ticket.id,
    status: ticket.status,
    quantity: ticket.quantity,
    reservationCode: ticket.reservationCode,
    createdAt: ticket.createdAt,
    cancelledAt: ticket.cancelledAt,

    user: ticket.user
      ? typeof ticket.user === "object"
        ? {
            id: ticket.user._id?.toString() || ticket.user.id,
            first_name: ticket.user.first_name,
            last_name: ticket.user.last_name,
            email: ticket.user.email,
            role: ticket.user.role
          }
        : ticket.user.toString()
      : null,

    event: ticket.event
      ? typeof ticket.event === "object"
        ? {
            id: ticket.event._id?.toString() || ticket.event.id,
            title: ticket.event.title,
            date: ticket.event.date,
            location: ticket.event.location
          }
        : ticket.event.toString()
      : null
  };
};