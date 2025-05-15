"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
//import authRoutes from "./routes/authRoutes";
const db_1 = require("./config/db");
//import { errorHandler } from "./middlewares/errorMiddleware";
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.connectDB)();
app.get("/", (req, res) => {
    res.send("Welcome to the API");
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//app.use("/api/auth", authRoutes);
//app.use(errorHandler);
exports.default = app;
