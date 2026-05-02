import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  availability: string;
  consultationFee: number;
  image?: string;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    availability: { type: String, required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema);
