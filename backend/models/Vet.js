import mongoose from "mongoose";

const vetSchema = new mongoose.Schema(
  {
    clinicName: { type: String, required: true, trim: true },
    ownerName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    services: [{ type: String }], // e.g. Vaccination, Surgery, Grooming
    isAvailable: { type: Boolean, default: true },
    role: { type: String, default: "vet" },
    location: {
      // GeoJSON point, used for "nearby" queries
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: [0, 0],
      },
    },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

vetSchema.index({ location: "2dsphere" });

export default mongoose.model("Vet", vetSchema);
