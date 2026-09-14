import {
  createEnrollment,
  getMyTickets,
  getEventTickets,
  cancelEnrollment
} from "../services/tickets.service.js";

import { ticketDTO } from "../dto/ticket.dto.js";

export const createTicketController = async (req, res) => {
  try {
    const ticket = await createEnrollment(
      req.params.eid,
      req.user,
      req.body.quantity
    );

    res.status(201).json({
      status: "success",
      payload: ticketDTO(ticket)
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Error interno del servidor"
    });
  }
};

export const getMyTicketsController = async (req, res) => {
  try {
    const tickets = await getMyTickets(req.user.id);

    res.status(200).json({
      status: "success",
      payload: tickets.map(ticketDTO)
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Error interno del servidor"
    });
  }
};

export const getEventTicketsController = async (req, res) => {
  try {
    const tickets = await getEventTickets(
      req.params.eid,
      req.user
    );

    res.status(200).json({
      status: "success",
      payload: tickets.map(ticketDTO)
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Error interno del servidor"
    });
  }
};

export const cancelTicketController = async (req, res) => {
  try {
    const ticket = await cancelEnrollment(
      req.params.tid,
      req.user
    );

    res.status(200).json({
      status: "success",
      payload: ticketDTO(ticket)
    });
  } catch (error) {
    console.error("ERROR AL CANCELAR TICKET:", error);

    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.statusCode
        ? error.message
        : "Error interno del servidor"
    });
  }
};