import { Router } from "express";
import { Appointment } from "../../database/models/Appointment.js";
import { Hospital } from "../../database/models/Hospital.js";
import { Doctor } from "../../database/models/Doctor.js";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "smartcare_dev_secret_change_in_prod";

// Simple auth middleware — extracts userId from Bearer token
function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─── User: Book appointment ───────────────────────────────────────────────────
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone } = req.body;

    if (!hospitalId || !doctorId || !date || !time || !reason)
      return res.status(400).json({ error: "All fields are required" });

    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const appointment = await Appointment.create({
      userId: req.userId,
      userName,
      userEmail,
      userPhone,
      hospitalId,
      hospitalName: hospital.name,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date,
      time,
      reason,
      status: "pending",
    });

    res.status(201).json(appointment);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// ─── User: Get my appointments ────────────────────────────────────────────────
router.get("/my", authMiddleware, async (req: any, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(appointments);
  } catch {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ─── Admin: Create appointment manually ──────────────────────────────────────
router.post("/admin", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin", "super_admin"].includes(req.userRole))
      return res.status(403).json({ error: "Forbidden" });

    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone, status } = req.body;

    if (!hospitalId || !doctorId || !date || !time || !reason || !userName || !userEmail)
      return res.status(400).json({ error: "All fields are required" });

    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const appointment = await Appointment.create({
      userId: "admin-created",
      userName, userEmail, userPhone: userPhone || "",
      hospitalId, hospitalName: hospital.name,
      doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty,
      date, time, reason,
      status: status || "confirmed",
    });

    res.status(201).json(appointment);
  } catch {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin", "super_admin"].includes(req.userRole))
      return res.status(403).json({ error: "Forbidden" });

    const { status, doctorId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;

    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 }).lean();
    res.json(appointments);
  } catch {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ─── Admin: Update appointment status ────────────────────────────────────────
router.patch("/:id", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin", "super_admin"].includes(req.userRole))
      return res.status(403).json({ error: "Forbidden" });

    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// ─── Doctor portal: Get appointments for a doctor ────────────────────────────
router.get("/doctor/:doctorId", authMiddleware, async (req: any, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .sort({ date: 1, time: 1 }).lean();
    res.json(appointments);
  } catch {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

export default router;
