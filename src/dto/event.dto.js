export const eventDTO = (event) => {
  if (!event) return null;

  return {
    id: event._id?.toString() || event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    price: event.price,
    status: event.status,
    organizer: event.organizer
      ? typeof event.organizer === "object"
        ? {
            id: event.organizer._id?.toString() || event.organizer.id,
            first_name: event.organizer.first_name,
            last_name: event.organizer.last_name,
            email: event.organizer.email,
            role: event.organizer.role
          }
        : event.organizer.toString()
      : null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};