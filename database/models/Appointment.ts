import mongoose, { Schema, Document } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface IAppointment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  hospitalId: mongoose.Types.ObjectId;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String, required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    hospitalName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);
