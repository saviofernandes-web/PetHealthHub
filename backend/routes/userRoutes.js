import express from "express";
import User from "../models/User.js";
import Vet from "../models/Vet.js";
import { protect, requireRole } from "../middleware/auth.js";
import { fetchGooglePlacesClinics } from "../utils/googlePlaces.js";
import { fetchOsmClinics } from "../utils/osmClinics.js";

const router = express.Router();

// @route GET /api/users/me
router.get("/me", protect, requireRole("user"), async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// @route PUT /api/users/me
router.put("/me", protect, requireRole("user"), async (req, res) => {
  const { name, phone, pets } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (pets) user.pets = pets;

  await user.save();
  res.json(user);
});

// @route GET /api/users/nearby-clinics?lat=..&lng=..
// Returns real vet clinics and hospitals near the given point, combining:
//   1. clinics registered on PetHealth Hub (have live availability)
//   2. real clinics/hospitals from OpenStreetMap (free, no API key needed)
//   3. Google Places results - only if GOOGLE_PLACES_API_KEY is set (optional)
//
// Starts with a tight 3km radius (what's right around you) and widens
// (10km, 25km, 50km) until at least a few results are found, so the user
// always sees the nearest options even when none are very close.
const SEARCH_TIERS_METERS = [3000, 10000, 25000, 50000];
const MIN_RESULTS = 3;

router.get("/nearby-clinics", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      const platformClinics = await Vet.find().select("-password");
      return res.json(platformClinics.map((c) => ({ ...c.toObject(), source: "platform" })));
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    let merged = [];
    let usedRadius = SEARCH_TIERS_METERS[SEARCH_TIERS_METERS.length - 1];
    let counts = { platform: 0, osm: 0 };
    const seenNames = new Set();
    const addUnique = (list) =>
      list.filter((c) => {
        const key = c.clinicName?.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });

    for (const radius of SEARCH_TIERS_METERS) {
      seenNames.clear();
      const [platformFound, osmFound] = await Promise.all([
        Vet.find({
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [lngNum, latNum] },
              $maxDistance: radius,
            },
          },
        }).select("-password"),
        fetchOsmClinics(latNum, lngNum, radius),
      ]);

      const platform = platformFound.map((c) => ({ ...c.toObject(), source: "platform" }));
      platform.forEach((c) => seenNames.add(c.clinicName?.toLowerCase().trim()));
      merged = [...platform, ...addUnique(osmFound)];
      counts = { platform: platform.length, osm: osmFound.length };
      usedRadius = radius;
      if (merged.length >= MIN_RESULTS) break;
    }

    // Google is called once (not per tier) to keep usage low; returns [] if no key
    const googleFound = await fetchGooglePlacesClinics(latNum, lngNum, usedRadius);
    merged = [...merged, ...addUnique(googleFound)];
    console.log(`Nearby search at ${latNum.toFixed(4)},${lngNum.toFixed(4)} (within ${usedRadius / 1000} km): registered ${counts.platform}, OpenStreetMap ${counts.osm}, Google ${googleFound.length}, shown ${merged.length}`);

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
