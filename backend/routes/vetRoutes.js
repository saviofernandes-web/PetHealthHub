import express from "express";
import Vet from "../models/Vet.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/vets  (public list - used by search page as fallback)
router.get("/", async (req, res) => {
  const vets = await Vet.find().select("-password");
  res.json(vets);
});

// @route GET /api/vets/me
router.get("/me", protect, requireRole("vet"), async (req, res) => {
  const vet = await Vet.findById(req.userId).select("-password");
  if (!vet) return res.status(404).json({ message: "Vet not found" });
  res.json(vet);
});

// @route PUT /api/vets/me  (update profile info)
router.put("/me", protect, requireRole("vet"), async (req, res) => {
  const { clinicName, ownerName, phone, address, services, lat, lng } = req.body;
  const vet = await Vet.findById(req.userId);
  if (!vet) return res.status(404).json({ message: "Vet not found" });

  if (clinicName) vet.clinicName = clinicName;
  if (ownerName) vet.ownerName = ownerName;
  if (phone) vet.phone = phone;
  if (address) vet.address = address;
  if (services) vet.services = services;
  if (lat && lng) vet.location = { type: "Point", coordinates: [lng, lat] };

  await vet.save();
  res.json(vet);
});

// @route PUT /api/vets/me/availability  (toggle available / unavailable)
router.put("/me/availability", protect, requireRole("vet"), async (req, res) => {
  const { isAvailable } = req.body;
  const vet = await Vet.findById(req.userId);
  if (!vet) return res.status(404).json({ message: "Vet not found" });

  vet.isAvailable = isAvailable;
  await vet.save();
  res.json({ isAvailable: vet.isAvailable });
});

export default router;
