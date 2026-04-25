import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { getLocation } from "../utils/getLocation";
import API from "../services/api";

function Home() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 📍 Get GPS
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const loc = await getLocation();
        setLocation(loc);

        const token = localStorage.getItem("token");

        // ✅ Only call if token exists
        if (token) {
          await API.post("/request/update-location", loc, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.log("Location error:", err);
      }
    };

    fetchLocation();
  }, []);

  // 🔎 Search places
  const handleSearch = async () => {
    if (!location) return;

    if (!search.trim()) {
      alert("🔍 Please enter something to search");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get(
        `/places/search?query=${search}&lat=${location.lat}&lng=${location.lng}`
      );

      console.log("API RESULT:", res.data); // 🔥 debug

      // ✅ Backend returns array
      setPlaces(res.data || []);
    } catch (err) {
      console.log("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <Layout>
      {/* 🔎 Search */}
      <div className="flex gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search (bus stand, hospital...)"
          className="flex-1 p-2 bg-gray-800 border border-green-500 rounded"
        />

        <button
          onClick={handleSearch}
          disabled={!location || loading}
          className="bg-green-500 px-3 rounded text-black disabled:opacity-50"
        >
          {loading ? "Searching..." : location ? "Search" : "Getting location..."}
        </button>
      </div>

      {/* 📍 Loading location */}
      {!location && (
        <p className="text-yellow-400 mb-2">
          📍 Fetching your location...
        </p>
      )}

      {/* 🗺️ Map */}
      {location && (
        <GoogleMap
          center={location}
          zoom={14}
          mapContainerStyle={{ width: "100%", height: "400px" }}
        >
          {/* Your location */}
          <Marker position={location} />

          {/* Search results */}
          {places?.map((p, i) => (
            <Marker
              key={i}
              position={{
                lat: Number(p.lat), // ✅ ensure number
                lng: Number(p.lng), // ✅ ensure number
              }}
            />
          ))}
        </GoogleMap>
      )}

      {/* 📋 RESULTS LIST */}
{places.length > 0 && (
  <div className="mt-4 space-y-2">
    <h2 className="text-green-400 font-bold">Results:</h2>

    {places.map((p, i) => (
      <div key={i} className="bg-gray-800 p-3 rounded">
        <h3 className="text-green-400 font-bold">{p.name}</h3>
        <p>{p.address}</p>
        <p className="text-sm text-green-300">{p.distance}</p>
      </div>
    ))}
  </div>
)}

      {/* 📍 Location display */}
      {location && (
        <p className="text-green-400 mt-2">
          📍 Lat: {location.lat}, Lng: {location.lng}
        </p>
      )}

      {/* 📋 Results list (NEW - useful UI) */}
      {places.length > 0 && (
        <div className="mt-4">
          <h2 className="text-green-400 mb-2">Results:</h2>

          {places.map((p, i) => (
            <div key={i} className="bg-gray-800 p-3 rounded mb-2">
              <h3 className="text-green-400 font-bold">{p.name}</h3>
              <p className="text-sm">{p.address}</p>
              <p className="text-green-300 text-sm">{p.distance}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Home;