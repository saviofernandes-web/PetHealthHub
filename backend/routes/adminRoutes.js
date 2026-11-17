import express from "express";
import User from "../models/User.js";
import Vet from "../models/Vet.js";
import AmbulanceRequest from "../models/AmbulanceRequest.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/admin/stats
router.get("/stats", protect, requireRole("admin"), async (req, res) => {
  const [userCount, vetCount, requestCount, pendingRequests] = await Promise.all([
    User.countDocuments(),
    Vet.countDocuments(),
    AmbulanceRequest.countDocuments(),
    AmbulanceRequest.countDocuments({ status: "pending" }),
  ]);

  res.json({ userCount, vetCount, requestCount, pendingRequests });
});

// @route GET /api/admin/users
router.get("/users", protect, requireRole("admin"), async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// @route GET /api/admin/vets
router.get("/vets", protect, requireRole("admin"), async (req, res) => {
  const vets = await Vet.find().select("-password").sort({ createdAt: -1 });
  res.json(vets);
});

// @route DELETE /api/admin/vets/:id
router.delete("/vets/:id", protect, requireRole("admin"), async (req, res) => {
  await Vet.findByIdAndDelete(req.params.id);
  res.json({ message: "Vet listing removed" });
});

// @route DELETE /api/admin/users/:id
router.delete("/users/:id", protect, requireRole("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});

export default router;
