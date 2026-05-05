import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env before anything else (local dev only — Render uses dashboard env vars)
config();

import { connectDB } from "../database/connect.js";
import hospitalsRouter from "./routes/hospitals.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));

  // CORS — allow all origins in production (Render serves both frontend + API)
  app.use((_req, res, next) => {
    const origin = _req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // API routes
  app.use("/api/hospitals",    hospitalsRouter);
  app.use("/api/users",        usersRouter);
  app.use("/api/auth",         authRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/payments",     paymentsRouter);

  // 404 for unknown API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Serve frontend in production
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || (process.env.NODE_ENV === "production" ? 3000 : 3001);

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\nPort ${port} is already in use.`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
    console.log(`RAZORPAY_KEY_ID set: ${!!process.env.RAZORPAY_KEY_ID}`);
  });
}

startServer().catch(console.error);
