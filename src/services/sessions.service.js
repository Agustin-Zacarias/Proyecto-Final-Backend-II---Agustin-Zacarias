import {
  getUserByEmail,
  saveUser,
} from "../repositories/users.repository.js";

import {
  createHash,
  isValidPassword,
} from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Registro de usuario
export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  if (!first_name || !last_name || !email || !password) {
    throw createError(
      "Faltan campos obligatorios",
      400
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createError(
      "Email inválido",
      400
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createError(
      "La contraseña debe tener al menos 8 caracteres",
      400
    );
  }

  const existingUser = await getUserByEmail(
    normalizedEmail
  );

  if (existingUser) {
    throw createError(
      "El email ya está registrado",
      409
    );
  }

  const hashedPassword = await createHash(password);

  const newUser = await saveUser({
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });

  return newUser;
};

// Login de usuario
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw createError(
      "Credenciales inválidas",
      401
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await getUserByEmail(
    normalizedEmail
  );

  if (!user) {
    throw createError(
      "Credenciales inválidas",
      401
    );
  }

  const validPassword = await isValidPassword(
    password,
    user.password
  );

  if (!validPassword) {
    throw createError(
      "Credenciales inválidas",
      401
    );
  }

  return user;
};