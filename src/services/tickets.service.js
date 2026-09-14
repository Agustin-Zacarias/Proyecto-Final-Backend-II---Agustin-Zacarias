import crypto from "crypto";

import {
  createTicketRepository,
  getTicketByIdRepository,
  getActiveTicketRepository,
  getUserTicketsRepository,
  getEventTicketsRepository,
  getOccupiedCapacityRepository,
  cancelTicketRepository
} from "../repositories/tickets.repository.js";

import { findEventById } from "../repositories/events.repository.js";

import { sendTicketConfirmationEmail } from "../utils/mailer.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateReservationCode = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
};

// Crear una inscripción
export const createEnrollment = async (eventId, user, quantity) => {
  // Buscar el evento
  const event = await findEventById(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  // No permitir inscripciones a eventos cancelados o finalizados
  if (event.status === "cancelled" || event.status === "finished") {
    throw createError(
      "No es posible inscribirse a un evento cancelado o finalizado",
      400
    );
  }

  // El evento debe estar publicado
  if (event.status !== "published") {
    throw createError(
      "El evento no está publicado",
      400
    );
  }

  // Validar cantidad solicitada
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw createError(
      "La cantidad debe ser un número entero mayor a 0",
      400
    );
  }

  // Verificar que el usuario no tenga otra inscripción activa
  const existingTicket = await getActiveTicketRepository(
    user.id,
    eventId
  );

  if (existingTicket) {
    throw createError(
      "El usuario ya tiene una inscripción activa para este evento",
      409
    );
  }

  // Calcular cupos ocupados
  const occupiedCapacity = await getOccupiedCapacityRepository(
    eventId
  );

  const availableCapacity =
    event.capacity - occupiedCapacity;

  // Verificar disponibilidad
  if (availableCapacity < parsedQuantity) {
    throw createError(
      `No hay cupos suficientes. Cupos disponibles: ${availableCapacity}`,
      400
    );
  }

  // Generar código único de reserva
  const reservationCode = generateReservationCode();

  // Crear ticket
  const ticket = await createTicketRepository({
    user: user.id,
    event: eventId,
    status: "confirmed",
    quantity: parsedQuantity,
    reservationCode,
  });

  // Enviar email de confirmación
  await sendTicketConfirmationEmail({
    to: user.email,
    event,
    ticket,
  });

  return ticket;
};

// Obtener los tickets del usuario autenticado
export const getMyTickets = async (userId) => {
  return await getUserTicketsRepository(userId);
};

// Obtener los tickets de un evento
export const getEventTickets = async (eventId, user) => {
  const event = await findEventById(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  const isAdmin = user.role === "admin";

  const isOwner =
    event.organizer &&
    event.organizer.toString() === user.id.toString();

  // Solo el organizador dueño del evento o un admin
  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para consultar las inscripciones de este evento",
      403
    );
  }

  return await getEventTicketsRepository(eventId);
};

// Cancelar una inscripción
export const cancelEnrollment = async (ticketId, user) => {
  const ticket = await getTicketByIdRepository(ticketId);

  if (!ticket) {
    throw createError("Ticket no encontrado", 404);
  }

  const isAdmin = user.role === "admin";

  const isOwner =
    ticket.user.toString() === user.id.toString();

  // Solo el dueño del ticket o un admin
  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para cancelar este ticket",
      403
    );
  }

  // No permitir cancelar dos veces
  if (ticket.status === "cancelled") {
    throw createError(
      "El ticket ya se encuentra cancelado",
      400
    );
  }

  // La cancelación no elimina el ticket.
  // Al quedar en status cancelled deja de ocupar cupo.
  return await cancelTicketRepository(ticketId);
};