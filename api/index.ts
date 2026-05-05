import express from "express";
import { config } from "dotenv";
config();

import { connectDB } from "../database/connect.js";
import hospitalsRouter from "../server/routes/hospitals.js";
import usersRouter from "../server/routes/users.js";
import authRouter from "../server/routes/auth.js";
import appointmentsRouter from "../server/routes/appointments.js";
import paymentsRouter from "../server/routes/payments.js";

const app = express();

app.use(express.json({ limit: "10mb" }));

// CORS — allow all origins on Vercel
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Connect DB once (cached across warm invocations)
let dbConnected = false;
app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

// Routes
app.use("/api/hospitals",    hospitalsRouter);
app.use("/api/users",        usersRouter);
app.use("/api/auth",         authRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments",     paymentsRouter);

app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;
