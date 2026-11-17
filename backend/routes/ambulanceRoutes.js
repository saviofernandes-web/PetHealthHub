import express from "express";
import AmbulanceRequest from "../models/AmbulanceRequest.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// @route POST /api/ambulance  (user creates a request)
router.post("/", protect, requireRole("user"), async (req, res) => {
  try {
    const { petName, contactNumber, location, coordinates, notes } = req.body;
    if (!contactNumber || !location) {
      return res.status(400).json({ message: "Contact number and location are required" });
    }

    const request = await AmbulanceRequest.create({
      user: req.userId,
      petName,
      contactNumber,
      location,
      coordinates,
      notes,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/ambulance/mine  (user views their own requests)
router.get("/mine", protect, requireRole("user"), async (req, res) => {
  const requests = await AmbulanceRequest.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(requests);
});

// @route GET /api/ambulance  (admin views all requests)
router.get("/", protect, requireRole("admin"), async (req, res) => {
  const requests = await AmbulanceRequest.find().populate("user", "name phone email").sort({ createdAt: -1 });
  res.json(requests);
});

// @route PUT /api/ambulance/:id/status  (admin updates status)
router.put("/:id/status", protect, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  const request = await AmbulanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = status;
  await request.save();
  res.json(request);
});

export default router;
