import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  basePrice: number;
  estimatedStay: number;
  description?: string;
}

const ServiceSchema = new Schema<IService>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    estimatedStay: { type: Number, required: true, min: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>("Service", ServiceSchema);
