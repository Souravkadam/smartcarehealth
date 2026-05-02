import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "CREATED" | "SUCCESS" | "FAILED";

export interface IPayment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;          // Razorpay order_id
  paymentId?: string;       // Razorpay payment_id (set on success)
  signature?: string;       // Razorpay signature (set on success)
  amount: number;           // in paise (₹1 = 100 paise)
  currency: string;
  description: string;      // e.g. "Appointment booking - Dr. Rajesh Kumar"
  appointmentId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:        { type: String, required: true, index: true },
    userName:      { type: String, required: true },
    userEmail:     { type: String, required: true },
    orderId:       { type: String, required: true, unique: true },
    paymentId:     { type: String },
    signature:     { type: String },
    amount:        { type: Number, required: true },
    currency:      { type: String, default: "INR" },
    description:   { type: String, required: true },
    appointmentId: { type: String },
    status:        { type: String, enum: ["CREATED","SUCCESS","FAILED"], default: "CREATED" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
