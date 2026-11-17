import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vet from "../models/Vet.js";

const router = express.Router();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ---------- USER (pet owner) ----------

// @route POST /api/auth/register/user
router.post("/register/user", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login/user
router.post("/login/user", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- VET / CLINIC ----------

// @route POST /api/auth/register/vet
router.post("/register/vet", async (req, res) => {
  try {
    const { clinicName, ownerName, email, password, phone, address, services, lat, lng } = req.body;
    if (!clinicName || !email || !password) {
      return res.status(400).json({ message: "Clinic name, email and password are required" });
    }

    const existing = await Vet.findOne({ email });
    if (existing) return res.status(400).json({ message: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const vet = await Vet.create({
      clinicName,
      ownerName,
      email,
      password: hashedPassword,
      phone,
      address,
      services: services || [],
      location: {
        type: "Point",
        coordinates: [lng || 0, lat || 0],
      },
    });

    res.status(201).json({
      _id: vet._id,
      clinicName: vet.clinicName,
      email: vet.email,
      role: vet.role,
      token: generateToken(vet._id, vet.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login/vet
router.post("/login/vet", async (req, res) => {
  try {
    const { email, password } = req.body;
    const vet = await Vet.findOne({ email });
    if (!vet) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, vet.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: vet._id,
      clinicName: vet.clinicName,
      email: vet.email,
      role: vet.role,
      token: generateToken(vet._id, vet.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
