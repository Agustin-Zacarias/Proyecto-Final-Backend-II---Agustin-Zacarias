import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";

// Crear un ticket
export const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

// Buscar un ticket por ID
export const getTicketById = async (ticketId) => {
  return await Ticket.findById(ticketId);
};

// Buscar si un usuario ya tiene un ticket activo para un evento
export const getActiveTicketByUserAndEvent = async (userId, eventId) => {
  return await Ticket.findOne({
    user: userId,
    event: eventId,
    status: { $ne: "cancelled" },
  });
};

// Obtener los tickets del usuario autenticado
export const getTicketsByUser = async (userId) => {
  return await Ticket.find({ user: userId })
    .populate("event", "title date location")
    .sort({ createdAt: -1 });
};

// Obtener los tickets correspondientes a un evento
export const getTicketsByEvent = async (eventId) => {
  return await Ticket.find({ event: eventId })
    .populate("user", "first_name last_name email")
    .sort({ createdAt: -1 });
};

// Calcular los cupos ocupados de un evento
// Los tickets cancelados no ocupan cupo
export const getOccupiedCapacity = async (eventId) => {
  const result = await Ticket.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$quantity",
        },
      },
    },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Cancelar un ticket sin eliminarlo de la base de datos
export const cancelTicket = async (ticketId) => {
  return await Ticket.findByIdAndUpdate(
    ticketId,
    {
      status: "cancelled",
      cancelledAt: new Date(),
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );
};