import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../database/models/Admin.js";
import { User } from "../../database/models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "smartcare_dev_secret_change_in_prod";
const JWT_EXPIRES = "7d";

// ─── User Register ────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body as {
      name: string; email: string; phone: string; password: string;
    };

    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash });

    const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── User Login ───────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    // Check users collection first
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid)
        return res.status(401).json({ error: "Invalid email or password" });

      const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      return res.json({
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: "user" },
      });
    }

    // Fallback: check admins collection
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid)
        return res.status(401).json({ error: "Invalid email or password" });

      const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      return res.json({
        token,
        user: { id: admin._id.toString(), name: admin.name, email: admin.email, phone: "", role: admin.role },
      });
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── Admin Login ──────────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
