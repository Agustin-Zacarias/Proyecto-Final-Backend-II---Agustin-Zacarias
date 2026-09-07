import {
  createEnrollment,
  getMyTickets,
  getEventTickets,
  cancelEnrollment,
} from "../services/tickets.service.js";

// Crear una inscripción
export const createTicketController = async (req, res) => {
  try {
    const { eid } = req.params;
    const { quantity } = req.body;

    const ticket = await createEnrollment(
      eid,
      req.user,
      quantity
    );

    return res.status(201).json({
      status: "success",
      message: "Inscripción confirmada",
      payload: ticket,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
    });
  }
};

// Obtener los tickets del usuario autenticado
export const getMyTicketsController = async (req, res) => {
  try {
    const tickets = await getMyTickets(req.user.id);

    return res.status(200).json({
      status: "success",
      payload: tickets,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
    });
  }
};

// Obtener los tickets de un evento
export const getEventTicketsController = async (req, res) => {
  try {
    const { eid } = req.params;

    const tickets = await getEventTickets(
      eid,
      req.user
    );

    return res.status(200).json({
      status: "success",
      payload: tickets,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
    });
  }
};

// Cancelar una inscripción
export const cancelTicketController = async (req, res) => {
  try {
    const { tid } = req.params;

    const ticket = await cancelEnrollment(
      tid,
      req.user
    );

    return res.status(200).json({
      status: "success",
      message: "Ticket cancelado correctamente",
      payload: ticket,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
    });
  }
};