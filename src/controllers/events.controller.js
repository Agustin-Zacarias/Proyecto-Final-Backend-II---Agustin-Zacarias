import {
  getEvents,
  getEvent,
  createNewEvent,
  updateExistingEvent,
  changeEventStatus
} from "../services/events.service.js";

import { eventDTO } from "../dto/event.dto.js";

export const getAllEvents = async (req, res) => {
  try {
    const result = await getEvents(req.query);

    res.status(200).json({
      status: "success",
      ...result,
      data: result.data.map(eventDTO)
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

export const getEventById = async (req, res) => {
  try {
    const event = await getEvent(req.params.id);

    res.status(200).json({
      status: "success",
      payload: eventDTO(event)
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

export const createEvent = async (req, res) => {
  try {
    const event = await createNewEvent(
      req.body,
      req.user
    );

    res.status(201).json({
      status: "success",
      payload: eventDTO(event)
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

export const updateEvent = async (req, res) => {
  try {
    const event = await updateExistingEvent(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      status: "success",
      payload: eventDTO(event)
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

export const updateEventStatus = async (req, res) => {
  try {
    const event = await changeEventStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      status: "success",
      payload: eventDTO(event)
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