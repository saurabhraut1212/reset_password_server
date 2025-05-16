import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
