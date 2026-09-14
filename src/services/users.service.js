import {
  getUserByEmail,
  saveUser,
  getAllUsers
} from "../repositories/users.repository.js";

export const getUserByEmailService = async (email) => {
  return await getUserByEmail(email);
};

export const createUserService = async (userData) => {
  return await saveUser(userData);
};

export const getAllUsersService = async () => {
  return await getAllUsers();
};