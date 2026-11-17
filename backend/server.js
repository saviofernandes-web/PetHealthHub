import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import Vet from "./models/Vet.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vetRoutes from "./routes/vetRoutes.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// The first version of this project added 4 made-up demo clinics to the database.
// They are deleted automatically on every start, so nobody has to remember to run
// a cleanup script. Real clinics come from OpenStreetMap / Google / registered vets.
const FAKE_DEMO_EMAILS = [
  "bandra.petcare@example.com",
  "andheri.animalhospital@example.com",
  "powai.pets@example.com",
  "dadar.vethospital@example.com",
];

connectDB().then(async () => {
  const result = await Vet.deleteMany({ email: { $in: FAKE_DEMO_EMAILS } });
  if (result.deletedCount) console.log(`Removed ${result.deletedCount} fake demo clinic(s) from the database.`);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PetHealth Hub API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/admin", adminRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
