import { useEffect, useState } from "react";
import axios from "axios";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";

const PlacesMap = ({ isHome, type }) => {
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 📍 Get location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // 🔍 Fetch API
  const fetchPlaces = async (query = "") => {
    if (!lat || !lng || !query) return;

    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5001/api/places/search",
        {
          params: {
            query,
            lat,
            lng,
            t: Date.now(),
          },
        }
      );

      setPlaces(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 AUTO LOAD
  useEffect(() => {
    if (!isHome && lat && lng && type) {
      fetchPlaces(type);
    }
  }, [lat, lng, type]);

  // 🔍 SEARCH
  const handleSearch = () => {
    if (!search.trim()) return;
    fetchPlaces(search);
  };

  return (
    <div className="p-4 text-white">

      {/* 🔎 SEARCH */}
      {isHome && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 bg-gray-800 border border-green-500 rounded"
          />
          <button
            onClick={handleSearch}
            disabled={!lat}
            className="bg-green-500 px-4 rounded disabled:opacity-50"
          >
            {lat ? "Search" : "Getting location..."}
          </button>
        </div>
      )}

      {/* 📍 LOCATION */}
      {lat && lng && (
        <p className="text-green-400 mb-2">
          📍 Lat: {lat}, Lng: {lng}
        </p>
      )}

      {/* ⏳ LOADING */}
      {loading && <p className="text-yellow-400">🔄 Loading...</p>}

      {/* 🗺️ MAP */}
      {isLoaded && lat && lng && (
        <GoogleMap
          center={{ lat, lng }}
          zoom={13}
          mapContainerStyle={{ width: "100%", height: "350px" }}
        >
          <Marker position={{ lat, lng }} />

          {places.map((p, i) => (
            <Marker key={i} position={{ lat: p.lat, lng: p.lng }} />
          ))}
        </GoogleMap>
      )}

      {/* 📋 RESULTS */}
      {!loading && places.length > 0 ? (
        places.map((p, i) => {

          // 🔥 SMART NUMBER LOGIC
          const phoneNumber = p.phone || "108";
          const ambulanceNumber = p.ambulanceNumber || p.phone || "108";

          return (
            <div
              key={i}
              className="bg-gray-800 p-4 rounded mb-3 flex justify-between items-center"
            >
              {/* LEFT */}
              <div>
                <h3 className="text-green-400 font-bold">{p.name}</h3>
                <p>{p.address}</p>
                <p className="text-sm text-green-300">{p.distance}</p>

                <div className="flex gap-2 mt-2">

                  {/* 📞 CALL */}
                  <button
                    className="bg-blue-500 px-3 py-1 rounded"
                    onClick={() => window.open(`tel:${phoneNumber}`)}
                  >
                    📞 Call
                  </button>

                  {/* 🗺️ NAVIGATE */}
                  <button
                    className="bg-green-600 px-3 py-1 rounded"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${p.lat},${p.lng}`
                      )
                    }
                  >
                    🗺️ Navigate
                  </button>

                </div>
              </div>

              {/* 🚑 AMBULANCE BUTTON (RIGHT SIDE) */}
              <div>
                <button
                  title="Call Ambulance"
                  onClick={() => window.open(`tel:${ambulanceNumber}`)}
                  className="bg-red-600 hover:bg-red-700 p-4 rounded-full text-white text-xl shadow-lg"
                >
                  🚑
                </button>
              </div>
            </div>
          );
        })
      ) : (
        !loading && <p>No results found</p>
      )}
    </div>
  );
};

export default PlacesMap;