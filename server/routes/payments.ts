import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { Payment } from "../../database/models/Payment.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "smartcare_dev_secret_change_in_prod";

// ─── Lazy Razorpay instance — reads keys at request time so .env is loaded ───
function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID     || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });
}

// Auth middleware
function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as any;
    req.userId    = payload.id;
    req.userRole  = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─── POST /api/payments/create-order ─────────────────────────────────────────
// Creates a Razorpay order and stores a CREATED record in MongoDB
router.post("/create-order", auth, async (req: any, res) => {
  try {
    const {
      amount,          // in rupees (e.g. 1500)
      description,
      userName,
      userEmail,
      appointmentId,
    } = req.body;

    if (!amount || !description)
      return res.status(400).json({ error: "amount and description are required" });

    const amountPaise = Math.round(Number(amount) * 100);

    // Create order on Razorpay
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: "INR",
      receipt:  `sc_${Date.now()}`,
      notes:    { userId: req.userId, description },
    });

    // Persist to MongoDB with CREATED status
    await Payment.create({
      userId:        req.userId,
      userName:      userName  || "Unknown",
      userEmail:     userEmail || "",
      orderId:       order.id,
      amount:        amountPaise,
      currency:      "INR",
      description,
      appointmentId: appointmentId || undefined,
      status:        "CREATED",
    });

    res.json({
      orderId:  order.id,
      amount:   amountPaise,
      currency: "INR",
      keyId:    process.env.RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME",
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// ─── POST /api/payments/verify ────────────────────────────────────────────────
// Verifies Razorpay signature and marks payment SUCCESS or FAILED
router.post("/verify", auth, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: "Missing payment verification fields" });

    // Verify HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "REPLACE_ME_SECRET";
    const body   = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSig === razorpay_signature;

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status:    isValid ? "SUCCESS" : "FAILED",
      },
      { new: true }
    );

    if (!payment)
      return res.status(404).json({ error: "Order not found" });

    if (!isValid)
      return res.status(400).json({ error: "Payment signature verification failed", status: "FAILED" });

    res.json({ success: true, status: "SUCCESS", paymentId: razorpay_payment_id });
  } catch (err: any) {
    console.error("verify error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Razorpay webhook for automatic status updates (optional)
router.post("/webhook", async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"] as string;

    if (secret) {
      const digest = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (digest !== signature) return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event   = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === "payment.captured" && payload) {
      await Payment.findOneAndUpdate(
        { orderId: payload.order_id },
        { paymentId: payload.id, status: "SUCCESS" }
      );
    } else if (event === "payment.failed" && payload) {
      await Payment.findOneAndUpdate(
        { orderId: payload.order_id },
        { status: "FAILED" }
      );
    }

    res.json({ received: true });
  } catch {
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// ─── GET /api/payments/my ─────────────────────────────────────────────────────
// User: get own payment history
router.get("/my", auth, async (req: any, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(payments);
  } catch {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ─── GET /api/payments ────────────────────────────────────────────────────────
// Admin: get all payments with optional filters
router.get("/", auth, async (req: any, res) => {
  try {
    if (!["admin", "super_admin"].includes(req.userRole))
      return res.status(403).json({ error: "Forbidden" });

    const { status, userId, from, to } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to)   filter.createdAt.$lte = new Date(to as string);
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(payments);
  } catch {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

export default router;
