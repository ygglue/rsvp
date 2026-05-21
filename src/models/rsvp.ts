import mongoose, { Schema, Document } from "mongoose";

export interface RsvpDocument extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const RsvpSchema = new Schema<RsvpDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export const Rsvp = mongoose.models.Rsvp ?? mongoose.model<RsvpDocument>("Rsvp", RsvpSchema);
