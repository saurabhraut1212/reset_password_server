import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User.model";
import { generateToken, sendEmail } from "../utils/sendEmail";

interface RegisterData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ServiceResult {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<ServiceResult> => {
  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser)
      return { success: false, message: "Email already registered" };

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      email: data.email,
      password: hashedPassword,
    });

    await user.save();
    return {
      success: true,
      message: "User registered successfully",
      data: user,
    };
  } catch {
    return { success: false, message: "Registration failed" };
  }
};

// Login Service
export const loginUser = async (data: LoginData): Promise<ServiceResult> => {
  try {
    const user = await User.findOne({ email: data.email });
    if (!user) return { success: false, message: "Invalid email or password" };

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch)
      return { success: false, message: "Invalid email or password" };

    const token = generateToken(user._id.toString());

    return {
      success: true,
      message: "Login successful",
      data: { id: user._id, email: user.email },
      token,
    };
  } catch {
    return { success: false, message: "Login failed" };
  }
};

export const forgotPasswordService = async (
  email: string
): Promise<ServiceResult> => {
  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

    await sendEmail(user.email, "Reset Password", html);

    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error" };
  }
};

export const resetPasswordService = async (
  token: string,
  password: string
): Promise<ServiceResult> => {
  try {
    const user: IUser | null = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error" };
  }
};
