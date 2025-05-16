import { Request, Response } from "express";
import {
  forgotPasswordService,
  loginUser,
  registerUser,
  resetPasswordService,
} from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await registerUser({ email, password });

  if (result.success) {
    res.status(201).json({ message: result.message, data: result.data });
  } else {
    res.status(400).json({ message: result.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });

  if (result.success) {
    res.status(200).json({ message: result.message, token: result.token });
  } else {
    res.status(401).json({ message: result.message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  const result = await forgotPasswordService(email);

  if (result.success) {
    res.status(200).json({ message: result.message });
  }
  res.status(400).json({ message: result.message });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;
  const result = await resetPasswordService(token, password);

  if (result.success) {
    res.status(200).json({ message: result.message });
  }
  res.status(400).json({ message: result.message });
};
