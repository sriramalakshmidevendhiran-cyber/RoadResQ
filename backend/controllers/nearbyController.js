const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// helper function
const getPlaces = async (lat, lng, type) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

  const response = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: 10000, // 10 km
      type,
      key: GOOGLE_API_KEY,
    },
  });

  return response.data.results;
};

// main controller
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    const hospitals = await getPlaces(lat, lng, "hospital");
    const police = await getPlaces(lat, lng, "police");
    const pharmacies = await getPlaces(lat, lng, "pharmacy");
    const hotels = await getPlaces(lat, lng, "lodging");
    const mechanics = await getPlaces(lat, lng, "car_repair");

    res.json({
      hospitals,
      police,
      pharmacies,
      hotels,
      mechanics,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching nearby places" });
  }
};