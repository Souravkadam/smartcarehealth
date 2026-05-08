// @ts-nocheck
/* eslint-disable */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Razorpay from "razorpay";

// ─── MongoDB Models (inline to avoid .js import issues on Vercel) ─────────────

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String, city: String, distance: Number,
  rating: Number, reviews: Number, beds: Number,
  icuBeds: Number, ots: Number,
  level: { type: String, enum: ["Premium","Standard","Basic"] },
  facilities: [String], specialties: [String], insurance: [String],
  aiScore: Number, bestFor: [String],
  image: String, images: [String],
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
  joinDate: { type: Date, default: Date.now },
  image: String,
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

// ─── DB Connection (cached across serverless invocations) ─────────────────────
let dbConnected = false;
async function connectDB() {
  if (dbConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  dbConnected = true;
  console.log("MongoDB connected:", mongoose.connection.host);
}

// ─── Auth helper ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "smartcare_dev_secret";
function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as any;
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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(async (_req, _res, next) => {
  try { await connectDB(); next(); }
  catch (e: any) {
    console.error("DB connection failed:", e.message);
    _res.status(500).json({ error: "Database connection failed", detail: e.message });
  }
});

// ─── HOSPITALS ────────────────────────────────────────────────────────────────
app.get("/api/hospitals", async (req, res) => {
  try {
    const { search, level, city } = req.query;
    const filter: any = {};
    if (level) filter.level = level;
    if (city) filter.city = city;
    if (search) filter.$text = { $search: search as string };
    const hospitals = await Hospital.find(filter).lean();
    const ids = hospitals.map((h: any) => h._id);
    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: { $in: ids } }).lean(),
      Service.find({ hospitalId: { $in: ids } }).lean(),
    ]);
    const result = hospitals.map((h: any) => ({
      ...h, id: h._id.toString(),
      doctors: doctors.filter((d: any) => d.hospitalId?.toString() === h._id.toString()).map((d: any) => ({ ...d, id: d._id.toString() })),
      services: services.filter((s: any) => s.hospitalId?.toString() === h._id.toString()).map((s: any) => ({ ...s, id: s._id.toString() })),
    }));
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to fetch hospitals" }); }
});

app.get("/api/hospitals/:id", async (req, res) => {
  try {
    const hospital: any = await Hospital.findById(req.params.id).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    const [doctors, services] = await Promise.all([
      Doctor.find({ hospitalId: hospital._id }).lean(),
      Service.find({ hospitalId: hospital._id }).lean(),
    ]);
    res.json({ ...hospital, id: hospital._id.toString(),
      doctors: (doctors as any[]).map(d => ({ ...d, id: d._id.toString() })),
      services: (services as any[]).map(s => ({ ...s, id: s._id.toString() })),
    });
  } catch { res.status(500).json({ error: "Failed to fetch hospital" }); }
});

app.patch("/api/hospitals/:id", async (req, res) => {
  try {
    const { image, images } = req.body;
    const hospital: any = await Hospital.findByIdAndUpdate(req.params.id,
      { ...(image !== undefined && { image }), ...(images !== undefined && { images }) },
      { new: true });
    if (!hospital) return res.status(404).json({ error: "Not found" });
    res.json({ ...hospital.toObject(), id: hospital._id.toString() });
  } catch { res.status(500).json({ error: "Failed to update" }); }
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 6) return res.status(400).json({ error: "Password min 6 chars" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user: any = await User.create({ name, email, phone, passwordHash });
    const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone } });
  } catch { res.status(500).json({ error: "Registration failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      if (!await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ error: "Invalid email or password" });
      const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: "user" } });
    }
    const admin: any = await Admin.findOne({ email: email.toLowerCase() });
    if (admin) {
      if (!await bcrypt.compare(password, admin.passwordHash)) return res.status(401).json({ error: "Invalid email or password" });
      const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: admin._id.toString(), name: admin.name, email: admin.email, phone: "", role: admin.role } });
    }
    res.status(401).json({ error: "Invalid email or password" });
  } catch { res.status(500).json({ error: "Login failed" }); }
});

app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin: any = await Admin.findOne({ email: email?.toLowerCase() });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role });
  } catch { res.status(500).json({ error: "Login failed" }); }
});

// ─── USERS ────────────────────────────────────────────────────────────────────
app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).lean();
    res.json((users as any[]).map(u => ({ ...u, id: u._id.toString() })));
  } catch { res.status(500).json({ error: "Failed to fetch users" }); }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields required" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user: any = await User.create({ name, email, phone, passwordHash, status: status || "Active" });
    res.status(201).json({ id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, status: user.status, appointments: user.appointments, joinDate: user.joinDate });
  } catch { res.status(500).json({ error: "Failed to create user" }); }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const { name, phone, image } = req.body;
    const user: any = await User.findByIdAndUpdate(req.params.id,
      { ...(name && { name }), ...(phone && { phone }), ...(image !== undefined && { image }) },
      { new: true, select: "-passwordHash" });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch { res.status(500).json({ error: "Failed to update user" }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete user" }); }
});

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
app.post("/api/appointments", authMiddleware, async (req: any, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone } = req.body;
    if (!hospitalId || !doctorId || !date || !time || !reason) return res.status(400).json({ error: "All fields required" });
    const hospital: any = await Hospital.findById(hospitalId).lean();
    const doctor: any = await Doctor.findById(doctorId).lean();
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const apt = await Appointment.create({ userId: req.userId, userName, userEmail, userPhone, hospitalId, hospitalName: hospital.name, doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty, date, time, reason, status: "pending" });
    res.status(201).json(apt);
  } catch { res.status(500).json({ error: "Failed to book appointment" }); }
});

app.get("/api/appointments/my", authMiddleware, async (req: any, res) => {
  try {
    const apts = await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(apts);
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

app.post("/api/appointments/admin", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { hospitalId, doctorId, date, time, reason, userName, userEmail, userPhone, status } = req.body;
    const hospital: any = await Hospital.findById(hospitalId).lean();
    const doctor: any = await Doctor.findById(doctorId).lean();
    if (!hospital || !doctor) return res.status(404).json({ error: "Not found" });
    const apt = await Appointment.create({ userId: "admin-created", userName, userEmail, userPhone: userPhone || "", hospitalId, hospitalName: hospital.name, doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty, date, time, reason, status: status || "confirmed" });
    res.status(201).json(apt);
  } catch { res.status(500).json({ error: "Failed to create" }); }
});

app.get("/api/appointments", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { status, doctorId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    res.json(await Appointment.find(filter).sort({ date: 1 }).lean());
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

app.patch("/api/appointments/:id", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
    if (!apt) return res.status(404).json({ error: "Not found" });
    res.json(apt);
  } catch { res.status(500).json({ error: "Failed to update" }); }
});

app.get("/api/appointments/doctor/:doctorId", authMiddleware, async (req: any, res) => {
  try {
    res.json(await Appointment.find({ doctorId: req.params.doctorId }).sort({ date: 1 }).lean());
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
app.post("/api/payments/create-order", authMiddleware, async (req: any, res) => {
  try {
    const { amount, description, userName, userEmail, appointmentId } = req.body;
    if (!amount || !description) return res.status(400).json({ error: "amount and description required" });
    const amountPaise = Math.round(Number(amount) * 100);
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || "", key_secret: process.env.RAZORPAY_KEY_SECRET || "" });
    const order: any = await razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt: `sc_${Date.now()}` });
    await Payment.create({ userId: req.userId, userName: userName || "Unknown", userEmail: userEmail || "", orderId: order.id, amount: amountPaise, currency: "INR", description, appointmentId: appointmentId || undefined, status: "CREATED" });
    res.json({ orderId: order.id, amount: amountPaise, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) { console.error("create-order error:", err); res.status(500).json({ error: "Failed to create payment order" }); }
});

app.post("/api/payments/verify", authMiddleware, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing fields" });
    const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const isValid = expectedSig === razorpay_signature;
    const payment = await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { paymentId: razorpay_payment_id, signature: razorpay_signature, status: isValid ? "SUCCESS" : "FAILED" }, { new: true });
    if (!payment) return res.status(404).json({ error: "Order not found" });
    if (!isValid) return res.status(400).json({ error: "Signature verification failed" });
    res.json({ success: true, status: "SUCCESS", paymentId: razorpay_payment_id });
  } catch { res.status(500).json({ error: "Verification failed" }); }
});

app.get("/api/payments/my", authMiddleware, async (req: any, res) => {
  try {
    res.json(await Payment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean());
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

app.get("/api/payments", authMiddleware, async (req: any, res) => {
  try {
    if (!["admin","super_admin"].includes(req.userRole)) return res.status(403).json({ error: "Forbidden" });
    const { status, userId, from, to } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (from || to) { filter.createdAt = {}; if (from) filter.createdAt.$gte = new Date(from as string); if (to) filter.createdAt.$lte = new Date(to as string); }
    res.json(await Payment.find(filter).sort({ createdAt: -1 }).lean());
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

app.post("/api/payments/webhook", async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;
    if (event === "payment.captured" && payload) await Payment.findOneAndUpdate({ orderId: payload.order_id }, { paymentId: payload.id, status: "SUCCESS" });
    else if (event === "payment.failed" && payload) await Payment.findOneAndUpdate({ orderId: payload.order_id }, { status: "FAILED" });
    res.json({ received: true });
  } catch { res.status(500).json({ error: "Webhook failed" }); }
});

app.use("/api/*", (_req, res) => res.status(404).json({ error: "API route not found" }));

// Global error handler — always return JSON, never HTML
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Vercel handler ───────────────────────────────────────────────────────────
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}