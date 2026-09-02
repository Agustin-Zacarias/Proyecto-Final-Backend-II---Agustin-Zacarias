import {
  getAllEvents,
  countEvents,
  createEvent,
  getEventById,
  updateEventById
} from "../dao/events.dao.js";

export const findAllEvents = async (
  filter = {},
  options = {}
) => {
  return await getAllEvents(filter, options);
};

export const countAllEvents = async (filter = {}) => {
  return await countEvents(filter);
};

export const saveEvent = async (eventData) => {
  return await createEvent(eventData);
};

export const findEventById = async (eventId) => {
  return await getEventById(eventId);
};

export const modifyEventById = async (
  eventId,
  eventData
) => {
  return await updateEventById(eventId, eventData);
};