import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import {
  registerUser,
  loginUser,
} from "../services/sessions.service.js";

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }

  return null;
};

export const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;

          const newUser = await registerUser({
            first_name,
            last_name,
            email,
            password,
          });

          return done(null, newUser);
        } catch (error) {
          return done(null, false, {
            message: error.message,
            statusCode: error.statusCode || 500,
          });
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await loginUser(
            email,
            password
          );

          return done(null, user);
        } catch (error) {
          return done(null, false, {
            message: error.message,
            statusCode: error.statusCode || 500,
          });
        }
      }
    )
  );

  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          return done(null, {
            id: jwtPayload.id,
            email: jwtPayload.email,
            role: jwtPayload.role,
          });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};