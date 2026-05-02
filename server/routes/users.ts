import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../../database/models/User.js";

const router = Router();

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).lean();
    res.json(users.map((u) => ({ ...u, id: u._id.toString() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users — admin creates a user
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body as {
      name: string; email: string; phone: string; password: string; status?: string;
    };

    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "Name, email, phone and password are required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, phone, passwordHash,
      status: status || "Active",
    });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      appointments: user.appointments,
      joinDate: user.joinDate,
    });
  } catch {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /api/users/:id — update user profile (name, phone, image)
router.patch("/:id", async (req, res) => {
  try {
    const { name, phone, image } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(phone && { phone }), ...(image !== undefined && { image }) },
      { new: true, select: "-passwordHash" }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
