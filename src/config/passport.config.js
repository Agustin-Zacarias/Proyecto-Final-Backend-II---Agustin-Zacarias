import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import { getUserByEmail, saveUser } from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;

          if (!first_name || !last_name || !email || !password) {
            return done(null, false, {
              message: "Faltan campos obligatorios",
              statusCode: 400
            });
          }

          const normalizedEmail = email.trim().toLowerCase();

          if (!EMAIL_REGEX.test(normalizedEmail)) {
            return done(null, false, {
              message: "Email inválido",
              statusCode: 400
            });
          }

          if (password.length < MIN_PASSWORD_LENGTH) {
            return done(null, false, {
              message: "La contraseña debe tener al menos 8 caracteres",
              statusCode: 400
            });
          }

          const existingUser = await getUserByEmail(normalizedEmail);

          if (existingUser) {
            return done(null, false, {
              message: "El email ya está registrado",
              statusCode: 409
            });
          }

          const hashedPassword = await createHash(password);

          const newUser = await saveUser({
            first_name,
            last_name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "user"
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          if (!email || !password) {
            return done(null, false, {
              message: "Credenciales inválidas",
              statusCode: 401
            });
          }

          const normalizedEmail = email.trim().toLowerCase();

          const user = await getUserByEmail(normalizedEmail);

          if (!user) {
            return done(null, false, {
              message: "Credenciales inválidas",
              statusCode: 401
            });
          }

          const validPassword = await isValidPassword(
            password,
            user.password
          );

          if (!validPassword) {
            return done(null, false, {
              message: "Credenciales inválidas",
              statusCode: 401
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET
      },
      async (jwtPayload, done) => {
        try {
          return done(null, {
            id: jwtPayload.id,
            email: jwtPayload.email,
            role: jwtPayload.role
          });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};