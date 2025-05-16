"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.forgotPasswordService = exports.loginUser = exports.registerUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../models/User.model");
const sendEmail_1 = require("../utils/sendEmail");
const registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield User_model_1.User.findOne({ email: data.email });
        if (existingUser)
            return { success: false, message: "Email already registered" };
        const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
        const user = new User_model_1.User({
            email: data.email,
            password: hashedPassword,
        });
        yield user.save();
        return {
            success: true,
            message: "User registered successfully",
            data: user,
        };
    }
    catch (_a) {
        return { success: false, message: "Registration failed" };
    }
});
exports.registerUser = registerUser;
// Login Service
const loginUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findOne({ email: data.email });
        if (!user)
            return { success: false, message: "Invalid email or password" };
        const isMatch = yield bcryptjs_1.default.compare(data.password, user.password);
        if (!isMatch)
            return { success: false, message: "Invalid email or password" };
        const token = (0, sendEmail_1.generateToken)(user._id.toString());
        return {
            success: true,
            message: "Login successful",
            data: { id: user._id, email: user.email },
            token,
        };
    }
    catch (_a) {
        return { success: false, message: "Login failed" };
    }
});
exports.loginUser = loginUser;
const forgotPasswordService = (email, origin) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findOne({ email });
        if (!user) {
            return { success: false, message: "User not found" };
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        const resetLink = `${origin}/reset-password/${token}`;
        const html = `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`;
        yield (0, sendEmail_1.sendEmail)(user.email, "Reset Password", html);
        return {
            success: true,
            message: "Password reset email sent",
            data: token,
        };
    }
    catch (error) {
        console.error(error);
        return { success: false, message: "Server error" };
    }
});
exports.forgotPasswordService = forgotPasswordService;
const resetPasswordService = (token, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });
        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }
        user.password = yield bcryptjs_1.default.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        yield user.save();
        return { success: true, message: "Password updated successfully" };
    }
    catch (error) {
        console.error(error);
        return { success: false, message: "Server error" };
    }
});
exports.resetPasswordService = resetPasswordService;
