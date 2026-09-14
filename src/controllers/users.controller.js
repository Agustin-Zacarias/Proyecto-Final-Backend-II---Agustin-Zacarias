import {
  getUserByEmailService,
  createUserService
} from "../services/users.service.js";

import { userDTO } from "../dto/user.dto.js";

import { getAllUsersService } from "../services/users.service.js";

export const getUserByEmailController = async (req, res) => {
  try {
    const user = await getUserByEmailService(req.params.email);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      status: "success",
      payload: userDTO(user)
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

export const createUserController = async (req, res) => {
  try {
    const user = await createUserService(req.body);

    res.status(201).json({
      status: "success",
      payload: userDTO(user)
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

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();

    res.status(200).json({
      status: "success",
      payload: users.map(userDTO)
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