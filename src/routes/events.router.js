import { Router } from "express";

import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus
} from "../controllers/events.controller.js";

import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Listado público con filtros, paginación y ordenamiento
router.get("/", getAllEvents);

// Consulta pública por ID
router.get("/:id", getEventById);

// Crear evento
router.post(
  "/",
  auth,
  authorize("organizer", "admin"),
  createEvent
);

// Modificar evento
router.put(
  "/:id",
  auth,
  authorize("organizer", "admin"),
  updateEvent
);

// Cambiar estado / cancelar evento
router.patch(
  "/:id/status",
  auth,
  authorize("organizer", "admin"),
  updateEventStatus
);

export default router;