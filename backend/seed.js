// Run with: node seed.js
// Removes the 4 made-up demo clinics that earlier versions of this project
// added to the database (Bandra Pet Care, Andheri Animal Hospital, Powai Pets,
// Dadar Vet Hospital). They had invented names and phone numbers, so they
// should not appear in the real app. Real clinics now come automatically from
// OpenStreetMap - nothing needs to be added by hand.
// Safe to run any number of times.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Vet from "./models/Vet.js";

dotenv.config();

const demoEmails = [
  "bandra.petcare@example.com",
  "andheri.animalhospital@example.com",
  "powai.pets@example.com",
  "dadar.vethospital@example.com",
];

const cleanup = async () => {
  await connectDB();
  const result = await Vet.deleteMany({ email: { $in: demoEmails } });
  console.log(`Removed ${result.deletedCount} demo clinic(s).`);
  mongoose.connection.close();
};

cleanup();
