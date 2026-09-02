import { Router } from "express";
import passport from "passport";

import {
  register,
  login,
  current,
  logout
} from "../controllers/sessions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

const passportCallback = (strategy, controller) => {
  return (req, res, next) => {
    passport.authenticate(
      strategy,
      { session: false },
      (error, user, info) => {
        if (error) {
          return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
          });
        }

        if (!user) {
          const message =
            strategy === "current"
              ? "No autenticado"
              : info?.message || "Credenciales inválidas";

          return res.status(info?.statusCode || 401).json({
            status: "error",
            message
          });
        }

        req.user = user;
        return controller(req, res, next);
      }
    )(req, res, next);
  };
};

router.post(
  "/register",
  passportCallback("register", register)
);

router.post(
  "/login",
  passportCallback("login", login)
);

router.get("/current", auth, current);

router.post("/logout", logout);

export default router;