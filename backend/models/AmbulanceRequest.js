import mongoose from "mongoose";

const ambulanceRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petName: { type: String },
    contactNumber: { type: String, required: true },
    location: { type: String, required: true }, // free-text address / landmark
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
