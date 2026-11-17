import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { type: String, default: "user" }, // user | admin
    pets: [
      {
        name: { type: String },
        species: { type: String }, // dog, cat, other
        breed: { type: String },
        age: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
