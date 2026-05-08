// @ts-nocheck
/* eslint-disable */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Razorpay from "razorpay";

// ─── MongoDB Models ───────────────────────────────────────────────────────────
const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true }, address: String, city: String,
  distance: Number, rating: Number, reviews: Number, beds: Number,
  icuBeds: Number, ots: Number,
  level: { type: String, enum: ["Premium","Standard","Basic"] },
  facilities: [String], specialties: [String], insurance: [String],
  aiScore: Number, bestFor: [String], image: String, images: [String],
  phone: String, email: String, website: String,
}, { timestamps: true });
HospitalSchema.index({ name: "text", city: "text", specialties: "text" });
const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);

const DoctorSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  name: String, specialty: String, experience: Number,
  rating: Number, availability: String, consultationFee: Number, image: String,
}, { timestamps: true });
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);

const ServiceSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  name: String, category: String, basePrice: Number,
  estimatedStay: Number, description: String,
}, { timestamps: true });
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  phone: String, passwordHash: String,
  status: { type: String, enum: ["Active","Inactive"], default: "Active" },
  appointments: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now }, image: String,
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const AdminSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, enum: ["admin","super_admin"], default: "admin" },
}, { timestamps: true });
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

const AppointmentSchema = new mongoose.Schema({
  userId: String, userName: String, userEmail: String, userPhone: String,
  hospitalId: mongoose.Schema.Types.ObjectId, hospitalName: String,
  doctorId: String, doctorName: String, doctorSpecialty: String,
  date: String, time: String, reason: String,
  status: { type: String, enum: ["pending","confirmed","cancelled","completed"], default: "pending" },
  notes: String,
}, { timestamps: true });
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);

const PaymentSchema = new mongoose.Schema({
  userId: String, userName: String, userEmail: String,
  orderId: { type: String, unique: true },
  paymentId: String, signature: String,
  amount: Number, currency: { type: String, default: "INR" },
  description: String, appointmentId: String,
  status: { type: String, enum: ["CREATED","SUCCESS","FAILED"], default: "CREATED" },
}, { timestamps: true });
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

// ─── DB Connection ────────────────────────────────────────────────────────────
let dbConnected = false;
async function connectDB() {
  if (dbConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment variables");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  dbConnected = true;
  console.log("MongoDB connected:", mongoose.connection.host);
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "smartcare_dev_secret";
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();

app.use(express.json({ limit: "10mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Health check — no DB needed, always works
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongoUri: !!process.env.MONGODB_URI,
    razorpay: !!process.env.RAZORPAY_KEY_ID,
    jwt: !!process.env.JWT_SECRET,
    env: process.env.NODE_ENV,
    dbState: mongoose.connection.readyState,
  });
});

// DB middleware — applied to all routes below
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    console.error("DB error:", e.message);
    res.status(500).json({ error: "Database connection failed", detail: e.message });
  }
});

// ─── HOSPITALS ────────────────────────────────────────────────────────────────
app.get("/api/hospitals", async (req, res) => {
  try {
    const { search, level, city } = req.query;
    const filter = {};
    if (level) filter.level = level;
    if (city) filter.city = city;
    if (search) filter.$text = { $search: search };
    const hospitals = await Hospital.find(filter).lean();
    const ids = hospitals.map(h => h._id);
    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: { $in: ids } }).lean(),
      Service.find({ hospitalId: { $in: ids } }).lean(),
    ]);
    res.json(hospitals.map(h => ({
      ...h, id: h._id.toString(),
      doctors: doctors.filter(d => d.hospitalId?.toString() === h._id.toString()).map(d => ({ ...d, id: d._id.toString() })),
      services: services.filter(s => s.hospitalId?.toString() === h._id.toString()).map(s => ({ ...s, id: s._id.toString() })),
    })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch hospitals", detail: e.message }); }
});

app.get("/api/hospitals/:id", async (req, res) => {
  try {
    const h = await Hospital.findById(req.params.id).lean();
    if (!h) return res.status(404).json({ error: "Hospital not found" });
    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: h._id }).lean(),
      Service.find({ hospitalId: h._id }).lean(),
    ]);
    res.json({ ...h, id: h._id.toString(),
      doctors: doctors.map(d => ({ ...d, id: d._id.toString() })),
      services: services.map(s => ({ ...s, id: s._id.toString() })),
    });
  } catch (e) { res.status(500).json({ error: "Failed to fetch hospital", detail: e.message }); }
});

app.patch("/api/hospitals/:id", async (req, res) => {
  try {
    const { image, images } = req.body;
    const h = await Hospital.findByIdAndUpdate(req.params.id,
      { ...(image !== undefined && { image }), ...(images !== undefined && { images }) },
      { new: true });
    if (!h) return res.status(404).json({ error: "Not found" });
    res.json({ ...h.toObject(), id: h._id.toString() });
  } catch (e) { res.status(500).json({ error: "Failed to update", detail: e.message }); }
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 6) return res.status(400).json({ error: "Password min 6 chars" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash });
    const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone } });
  } catch (e) { res.status(500).json({ error: "Registration failed", detail: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      if (!await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ error: "Invalid email or password" });
      const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: "user" } });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (admin) {
      if (!await bcrypt.compare(password, admin.passwordHash)) return res.status(401).json({ error: "Invalid email or password" });
      const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: admin._id.toString(), name: admin.name, email: admin.email, phone: "", role: admin.role } });
    }
    res.status(401).json({ error: "Invalid email or password" });
  } catch (e) { res.status(500).json({ error: "Login failed", detail: e.message }); }
});

app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase() });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role });
  } catch (e) { res.status(500).json({ error: "Login failed", detail: e.message }); }
});

// ─── USERS ────────────────────────────────────────────────────────────────────
app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).lean();
    res.json(users.map(u => ({ ...u, id: u._id.toString() })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch users", detail: e.message }); }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields required" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash, status: status || "Active" });
    res.status(201).json({ id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, status: user.status, appointments: user.appointments, joinDate: user.joinDate });
  } catch (e) { res.status(500).json({ error: "Failed to create user", detail: e.message }); }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const { name, phone, image } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id,
      { ...(name && { name }), ...(phone && { phone }), ...(image !== undefined && { image }) },
      { new: true, select: "-passwordHash" });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (e) { res.status(500).json({ error: "Failed to update user", detail: e.message }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete user", detail: e.message }); }
});

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
app.post("/api/appointments", requireAuth, async (req, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone } = req.body;
    if (!hospitalId || !doctorId || !date || !time || !reason) return res.status(400).json({ error: "All fields required" });
    const hospital = await Hospital.findById(hospitalId).lean();
    const doctor = await Doctor.findById(doctorId).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const apt = await Appointment.create({ userId: req.userId, userName, userEmail, userPhone, hospitalId, hospitalName: hospital.name, doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty, date, time, reason, status: "pending" });
    res.status(201).json(apt);
  } catch (e) { res.status(500).json({ error: "Failed to book appointment", detail: e.message }); }
});

app.get("/api/appointments/my", requireAuth, async (req, res) => {
  try {
    res.json(await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean());
  } catch (e) { res.status(500).json({ error: "Failed to fetch", detail: e.message }); }
});

app.post("/api/appointments/admin", requireAuth, async (req, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone, status } = req.body;
    const hospital = await Hospital.findById(hospitalId).lean();
    const doctor = await Doctor.findById(doctorId).lean();
    if (!hospital || !doctor) return res.status(404).json({ error: "Not found" });
    const apt = await Appointment.create({ userId: "admin-created", userName, userEmail, userPhone: userPhone || "", hospitalId, hospitalName: hospital.name, doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty, date, time, reason, status: status || "confirmed" });
    res.status(201).json(apt);
  } catch (e) { res.status(500).json({ error: "Failed to create", detail: e.message }); }
});

app.get("/api/appointments", requireAuth, async (req, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { status, doctorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    res.json(await Appointment.find(filter).sort({ date: 1 }).lean());
  } catch (e) { res.status(500).json({ error: "Failed to fetch", detail: e.message }); }
});

app.patch("/api/appointments/:id", requireAuth, async (req, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
    if (!apt) return res.status(404).json({ error: "Not found" });
    res.json(apt);
  } catch (e) { res.status(500).json({ error: "Failed to update", detail: e.message }); }
});

app.get("/api/appointments/doctor/:doctorId", requireAuth, async (req, res) => {
  try {
    res.json(await Appointment.find({ doctorId: req.params.doctorId }).sort({ date: 1 }).lean());
  } catch (e) { res.status(500).json({ error: "Failed to fetch", detail: e.message }); }
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
app.post("/api/payments/create-order", requireAuth, async (req, res) => {
  try {
    const { amount, description, userName, userEmail, appointmentId } = req.body;
    if (!amount || !description) return res.status(400).json({ error: "amount and description required" });
    const amountPaise = Math.round(Number(amount) * 100);
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || "", key_secret: process.env.RAZORPAY_KEY_SECRET || "" });
    const order = await razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt: `sc_${Date.now()}` });
    await Payment.create({ userId: req.userId, userName: userName || "Unknown", userEmail: userEmail || "", orderId: order.id, amount: amountPaise, currency: "INR", description, appointmentId: appointmentId || undefined, status: "CREATED" });
    res.json({ orderId: order.id, amount: amountPaise, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) { console.error("create-order error:", e); res.status(500).json({ error: "Failed to create payment order", detail: e.message }); }
});

app.post("/api/payments/verify", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing fields" });
    const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const isValid = expectedSig === razorpay_signature;
    const payment = await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { paymentId: razorpay_payment_id, signature: razorpay_signature, status: isValid ? "SUCCESS" : "FAILED" }, { new: true });
    if (!payment) return res.status(404).json({ error: "Order not found" });
    if (!isValid) return res.status(400).json({ error: "Signature verification failed" });
    res.json({ success: true, status: "SUCCESS", paymentId: razorpay_payment_id });
  } catch (e) { res.status(500).json({ error: "Verification failed", detail: e.message }); }
});

app.get("/api/payments/my", requireAuth, async (req, res) => {
  try {
    res.json(await Payment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean());
  } catch (e) { res.status(500).json({ error: "Failed to fetch", detail: e.message }); }
});

app.get("/api/payments", requireAuth, async (req, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { status, userId, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (from || to) { filter.createdAt = {}; if (from) filter.createdAt.$gte = new Date(from); if (to) filter.createdAt.$lte = new Date(to); }
    res.json(await Payment.find(filter).sort({ createdAt: -1 }).lean());
  } catch (e) { res.status(500).json({ error: "Failed to fetch", detail: e.message }); }
});

app.post("/api/payments/webhook", async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;
    if (event === "payment.captured" && payload) await Payment.findOneAndUpdate({ orderId: payload.order_id }, { paymentId: payload.id, status: "SUCCESS" });
    else if (event === "payment.failed" && payload) await Payment.findOneAndUpdate({ orderId: payload.order_id }, { status: "FAILED" });
    res.json({ received: true });
  } catch (e) { res.status(500).json({ error: "Webhook failed", detail: e.message }); }
});

// 404 + global error handler
app.use("/api/*", (_req, res) => res.status(404).json({ error: "API route not found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Vercel export ────────────────────────────────────────────────────────────
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
