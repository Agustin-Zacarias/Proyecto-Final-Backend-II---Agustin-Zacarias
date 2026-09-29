import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";

import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/users.router.js";
import { initializePassport } from "./config/passport.config.js";
import ticketsRouter from "./routes/tickets.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor activo"
  });
});

app.use("/api/events", eventsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

app.use(errorMiddleware);


export default app;