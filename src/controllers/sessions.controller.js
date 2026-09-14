import { generateToken } from "../utils/jwt.js";
import { userDTO } from "../dto/user.dto.js";

export const register = async (req, res) => {
  try {
    const user = req.user;

    res.status(201).json({
      status: "success",
      payload: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = req.user;

    const token = generateToken(user);

    res.cookie("currentUser", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
      secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};

export const current = async (req, res) => {
  res.status(200).json({
    status: "success",
    payload: userDTO(req.user)
  });
};

export const logout = async (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};