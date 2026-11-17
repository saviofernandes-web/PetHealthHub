// Fetches real vet clinics/hospitals near a point using Google's Places API (New).
// Returns [] silently if no API key is set or the request fails, so the app
// keeps working with OpenStreetMap + registered clinics.
//
// Cost protection: only "Pro" tier fields are requested (name, address,
// location, status) which keeps usage inside Google's larger free monthly
// allowance, and results are cached for 10 minutes per ~1km area so moving
// around or refreshing doesn't burn through requests.

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";
const FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus";
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();

export const mapGooglePlaces = (places = []) =>
  places
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY" && p.location && p.displayName?.text)
    .map((p) => ({
      _id: `google_${p.id}`,
      source: "google",
      clinicName: p.displayName.text,
      address: p.formattedAddress || "Address not listed",
      services: [],
      location: { type: "Point", coordinates: [p.location.longitude, p.location.latitude] },
    }));

export const fetchGooglePlacesClinics = async (lat, lng, radiusMeters = 10000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") return [];

  const radius = Math.min(radiusMeters, 50000); // Google's maximum
  const cacheKey = `${lat.toFixed(2)}|${lng.toFixed(2)}|${radius}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.data;

  try {
    const res = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: ["veterinary_care"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });

    if (!res.ok) {
      console.error("Google Places error:", res.status, await res.text());
      return [];
    }

    const data = mapGooglePlaces((await res.json()).places);
    cache.set(cacheKey, { time: Date.now(), data });
    return data;
  } catch (error) {
    console.error("Google Places fetch failed:", error.message);
    return [];
  }
};
