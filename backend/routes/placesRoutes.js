const express = require("express");
const axios = require("axios");
const router = express.Router();

// 🧠 AI INTENT EXTRACTION
function extractIntent(query) {
  const q = query.toLowerCase();

  const cleaned = q
    .replace(/near me|nearby|closest|around me|in my area/g, "")
    .trim();

  if (cleaned.includes("bakery")) return "bakery";
  if (cleaned.includes("hotel")) return "hotel";
  if (cleaned.includes("temple")) return "hindu temple";
  if (cleaned.includes("food") || cleaned.includes("restaurant")) return "restaurant";
  if (cleaned.includes("hospital")) return "hospital";
  if (cleaned.includes("mechanic") || cleaned.includes("repair")) return "car repair";

  if (
    cleaned.includes("pharmacy") ||
    cleaned.includes("medical") ||
    cleaned.includes("chemist")
  ) return "pharmacy";

  if (cleaned.includes("petrol") || cleaned.includes("fuel")) return "petrol station";

  return cleaned; // exact search
}

// 🧠 Mapping fallback
function mapQuery(userQuery) {
  const q = userQuery.toLowerCase();

  if (q.includes("repair")) return "car repair";
  if (q.includes("medical")) return "pharmacy";
  if (q.includes("stay")) return "hotel";
  if (q.includes("bus")) return "bus station";
  if (q.includes("atm")) return "atm";
  if (q.includes("toilet")) return "toilet";

  return userQuery;
}

// 📏 Distance Calculation
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 🔁 Safe Fetch
async function safeFetch(url) {
  try {
    return await axios.get(url, {
      headers: { "User-Agent": "RoadResQ-App" },
    });
  } catch (err) {
    console.log("⚠️ API ERROR:", err.response?.status);
    return { data: [] };
  }
}

// 🔍 SEARCH ROUTE
router.get("/search", async (req, res) => {
  try {
    const { query, lat, lng } = req.query;

    if (!query || !lat || !lng) {
      return res.status(400).json({ message: "Missing params" });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // 🧠 AI processing
    const finalQuery = extractIntent(query);
    const mappedQuery = mapQuery(finalQuery);

    let queries = [finalQuery, mappedQuery];

    // 🔥 PHARMACY BOOST (India fix)
    if (finalQuery.includes("pharmacy")) {
      queries.push("medical store", "chemist", "drugstore");
    }

    // 🔥 FOOD BOOST
    if (finalQuery.includes("restaurant")) {
      queries.push("food", "hotel");
    }

    queries = [...new Set(queries)];

    // 🔥 MULTI-RADIUS SEARCH (NO EARLY BREAK)
    const radiuses = [0.1, 0.3, 0.7]; // 3km → 10km → 25km

    let finalResults = [];

    for (const radius of radiuses) {
      for (const q of queries) {
        const left = lngNum - radius;
        const right = lngNum + radius;
        const top = latNum + radius;
        const bottom = latNum - radius;

        const response = await safeFetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=20&bounded=1&viewbox=${left},${top},${right},${bottom}`
        );

        finalResults = [...finalResults, ...response.data];
      }
    }

    let results = finalResults.map((place) => {
      const distance = getDistance(
        latNum,
        lngNum,
        parseFloat(place.lat),
        parseFloat(place.lon)
      );

      return {
        name: place.display_name.split(",")[0],
        address: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        distance,
      };
    });

    // 🔁 Remove duplicates
    const unique = {};
    results = results.filter((p) => {
      const key = p.lat + "_" + p.lng;
      if (unique[key]) return false;
      unique[key] = true;
      return true;
    });

    // ✅ SORT (nearest first)
    results.sort((a, b) => a.distance - b.distance);

    // 🎯 SMART FILTER

    // 1️⃣ within 5km
    let filtered = results.filter((p) => p.distance <= 5);

    // 2️⃣ within 10km
    if (filtered.length === 0) {
      filtered = results.filter((p) => p.distance <= 10);
    }

    // 3️⃣ within 15km
    if (filtered.length === 0) {
      filtered = results.filter((p) => p.distance <= 15);
    }

    // 4️⃣ fallback (closest available)
    if (filtered.length === 0) {
      filtered = results;
    }

    // ✅ LIMIT RESULTS
    results = filtered.slice(0, 8);

    // 🎯 FORMAT
    results = results.map((p) => ({
      ...p,
      distance: `${p.distance.toFixed(2)} km`,
    }));

    res.json(results);

  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(200).json([]);
  }
});

module.exports = router;