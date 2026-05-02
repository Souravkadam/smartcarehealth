import mongoose, { Schema, Document } from "mongoose";

export type HospitalLevel = "Premium" | "Standard" | "Basic";

export interface IHospital extends Document {
  name: string;
  address: string;
  city: string;
  distance: number;
  rating: number;
  reviews: number;
  beds: number;
  icuBeds: number;
  ots: number;
  level: HospitalLevel;
  facilities: string[];
  specialties: string[];
  insurance: string[];
  aiScore: number;
  bestFor: string[];
  image?: string;
  images?: string[];
  phone: string;
  email: string;
  website?: string;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    distance: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    beds: { type: Number, required: true, min: 0 },
    icuBeds: { type: Number, required: true, min: 0 },
    ots: { type: Number, required: true, min: 0 },
    level: {
      type: String,
      enum: ["Premium", "Standard", "Basic"],
      required: true,
      index: true,
    },
    facilities: [{ type: String }],
    specialties: [{ type: String }],
    insurance: [{ type: String }],
    aiScore: { type: Number, required: true, min: 0, max: 100 },
    bestFor: [{ type: String }],
    image: { type: String },
    images: [{ type: String }],
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: { type: String },
  },
  { timestamps: true }
);

// Text index for search
HospitalSchema.index({ name: "text", city: "text", specialties: "text" });

export const Hospital = mongoose.model<IHospital>("Hospital", HospitalSchema);
