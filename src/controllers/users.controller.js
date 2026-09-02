import { getAllUsers } from "../repositories/users.repository.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      status: "success",
      payload: users
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};