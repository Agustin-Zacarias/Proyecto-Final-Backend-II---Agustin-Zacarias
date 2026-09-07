import {
  createTicket,
  getTicketById,
  getActiveTicketByUserAndEvent,
  getTicketsByUser,
  getTicketsByEvent,
  getOccupiedCapacity,
  cancelTicket,
} from "../dao/tickets.dao.js";

export const createTicketRepository = async (ticketData) => {
  return await createTicket(ticketData);
};

export const getTicketByIdRepository = async (ticketId) => {
  return await getTicketById(ticketId);
};

export const getActiveTicketRepository = async (userId, eventId) => {
  return await getActiveTicketByUserAndEvent(userId, eventId);
};

export const getUserTicketsRepository = async (userId) => {
  return await getTicketsByUser(userId);
};

export const getEventTicketsRepository = async (eventId) => {
  return await getTicketsByEvent(eventId);
};

export const getOccupiedCapacityRepository = async (eventId) => {
  return await getOccupiedCapacity(eventId);
};

export const cancelTicketRepository = async (ticketId) => {
  return await cancelTicket(ticketId);
};