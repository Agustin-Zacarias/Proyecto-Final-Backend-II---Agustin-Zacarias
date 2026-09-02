import Event from "../models/Event.js";

export const getAllEvents = async (
  filter = {},
  options = {}
) => {
  const {
    skip = 0,
    limit = 10,
    sort = { date: 1 }
  } = options;

  return await Event.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countEvents = async (filter = {}) => {
  return await Event.countDocuments(filter);
};

export const createEvent = async (eventData) => {
  return await Event.create(eventData);
};

export const getEventById = async (eventId) => {
  return await Event.findById(eventId);
};

export const updateEventById = async (
  eventId,
  eventData
) => {
  return await Event.findByIdAndUpdate(
    eventId,
    eventData,
    {
      new: true,
      runValidators: true
    }
  );
};