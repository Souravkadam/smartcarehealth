import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env before anything else
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

  app.use(express.json());

  // Allow requests from Vite dev server
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // API routes
  app.use("/api/hospitals", hospitalsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/payments", paymentsRouter);

  // 404 for unknown API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // In production, serve the built frontend
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  const port = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001);

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\nPort ${port} is already in use.`);
      console.error(`Run this to free it:  npx kill-port ${port}\n`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
