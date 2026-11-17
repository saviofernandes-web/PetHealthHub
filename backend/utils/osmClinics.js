// Fetches real veterinary clinics and animal hospitals near a point from
// OpenStreetMap, using the free Overpass API. No API key or account needed.
// Everything returned here is real, community-mapped data (name, address,
// phone and opening hours are only included when someone has added them to
// OpenStreetMap - nothing is invented or filled in by this app).

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter", // backup mirror
];

// Converts raw OpenStreetMap elements into the same shape the app uses for
// platform-registered clinics. Exported separately so it can be tested.
export const mapOsmElements = (elements = []) => {
  const seen = new Set();
  const clinics = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || tags["name:en"] || "").trim();
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;

    // Skip entries with no name (useless to a user) or no usable location
    if (!name || lat == null || lon == null) continue;

    // OpenStreetMap can list the same place as both a node and a building
    const key = `${name.toLowerCase()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const streetLine = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
    const address =
      tags["addr:full"] ||
      [streetLine, tags["addr:suburb"], tags["addr:city"], tags["addr:postcode"]]
        .filter(Boolean)
        .join(", ") ||
      "Address not listed";

    clinics.push({
      _id: `osm_${el.type}_${el.id}`,
      source: "osm",
      clinicName: name,
      address,
      phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null,
      openingHours: tags.opening_hours || null,
      services: [],
      location: { type: "Point", coordinates: [lon, lat] },
    });
  }

  return clinics;
};

const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();

export const fetchOsmClinics = async (lat, lng, radiusMeters = 10000) => {
  // Same ~1km area asked again within 10 minutes: answer instantly, and be kind
  // to the free OpenStreetMap servers.
  const cacheKey = `${lat.toFixed(2)}|${lng.toFixed(2)}|${radiusMeters}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.data;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
      way["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "PetHealthHub/1.0 (college project)",
        },
        body: "data=" + encodeURIComponent(query),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        console.error(`OpenStreetMap request failed (${res.status}) at ${endpoint}`);
        continue; // try the backup mirror
      }

      const data = mapOsmElements((await res.json()).elements);
      cache.set(cacheKey, { time: Date.now(), data }); // only successful answers are cached
      return data;
    } catch (error) {
      console.error(`OpenStreetMap request error at ${endpoint}:`, error.message);
    }
  }

  return []; // both servers failed - app still works with platform clinics
};
