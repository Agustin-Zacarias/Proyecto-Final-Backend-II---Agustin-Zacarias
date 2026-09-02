import {
  findAllEvents,
  countAllEvents,
  saveEvent,
  findEventById,
  modifyEventById
} from "../repositories/events.repository.js";

const VALID_STATUSES = [
  "draft",
  "published",
  "cancelled",
  "finished"
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const checkOwnership = (event, user) => {
  if (
    user.role !== "admin" &&
    event.organizer.toString() !== user.id
  ) {
    throw createError(
      "No tenés permisos para realizar esta acción",
      403
    );
  }
};

// Listado con filtros, paginación y ordenamiento
export const getEvents = async (query = {}) => {
  const {
    status,
    category,
    location,
    dateFrom,
    dateTo,
    sort = "date"
  } = query;

  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);

  const filter = {};

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw createError("Estado inválido", 400);
    }

    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (location) {
    filter.location = location;
  }

  if (dateFrom || dateTo) {
    filter.date = {};

    if (dateFrom) {
      const from = new Date(dateFrom);

      if (Number.isNaN(from.getTime())) {
        throw createError("dateFrom inválida", 400);
      }

      filter.date.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);

      if (Number.isNaN(to.getTime())) {
        throw createError("dateTo inválida", 400);
      }

      filter.date.$lte = to;
    }
  }

  const skip = (page - 1) * limit;

  const sortOptions = {};

  if (sort.startsWith("-")) {
    sortOptions[sort.substring(1)] = -1;
  } else {
    sortOptions[sort] = 1;
  }

  const [events, total] = await Promise.all([
    findAllEvents(filter, {
      skip,
      limit,
      sort: sortOptions
    }),
    countAllEvents(filter)
  ]);

  return {
    data: events,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

// Obtener un evento por ID
export const getEvent = async (eventId) => {
  const event = await findEventById(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  return event;
};

// Crear evento
export const createNewEvent = async (eventData, user) => {
  const {
    title,
    description,
    category,
    date,
    location,
    capacity,
    price,
    status
  } = eventData;

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !location ||
    capacity === undefined ||
    price === undefined
  ) {
    throw createError("Faltan campos obligatorios", 400);
  }

  const eventDate = new Date(date);

  if (
    Number.isNaN(eventDate.getTime()) ||
    eventDate <= new Date()
  ) {
    throw createError(
      "La fecha del evento debe ser futura",
      400
    );
  }

  if (Number(capacity) <= 0) {
    throw createError(
      "La capacidad debe ser mayor a 0",
      400
    );
  }

  if (Number(price) < 0) {
    throw createError(
      "El precio no puede ser negativo",
      400
    );
  }

  if (status && !VALID_STATUSES.includes(status)) {
    throw createError("Estado inválido", 400);
  }

  return await saveEvent({
    title,
    description,
    category,
    date: eventDate,
    location,
    capacity,
    price,
    status: status || "draft",
    organizer: user.id
  });
};

// Modificar evento
export const updateExistingEvent = async (
  eventId,
  eventData,
  user
) => {
  const event = await getEvent(eventId);

  checkOwnership(event, user);

  if (event.status === "cancelled") {
    throw createError(
      "Los eventos cancelados no pueden modificarse",
      400
    );
  }

  if (
    eventData.capacity !== undefined &&
    Number(eventData.capacity) <= 0
  ) {
    throw createError(
      "La capacidad debe ser mayor a 0",
      400
    );
  }

  if (
    eventData.price !== undefined &&
    Number(eventData.price) < 0
  ) {
    throw createError(
      "El precio no puede ser negativo",
      400
    );
  }

  // Estos campos no se modifican desde el PUT general.
  const {
    organizer,
    status,
    ...allowedData
  } = eventData;

  return await modifyEventById(eventId, allowedData);
};

// Cambiar estado
export const changeEventStatus = async (
  eventId,
  newStatus,
  user
) => {
  const event = await getEvent(eventId);

  checkOwnership(event, user);

  if (event.status === "cancelled") {
    throw createError(
      "No se puede cambiar el estado de un evento cancelado",
      400
    );
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    throw createError("Estado inválido", 400);
  }

  if (
    newStatus === "published" &&
    event.status === "finished"
  ) {
    throw createError(
      "No se puede publicar un evento finalizado",
      400
    );
  }

  return await modifyEventById(eventId, {
    status: newStatus
  });
};