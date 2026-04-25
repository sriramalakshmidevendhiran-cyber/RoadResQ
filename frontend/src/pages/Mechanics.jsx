import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";

export default function Mechanics() {
  return (
    <Layout>
      <h1 className="text-green-400 mb-3">🔧 Nearby Mechanics</h1>

      {/* ✅ AUTO LOAD TYPE */}
      <PlacesMap isHome={false} type="mechanic" />
    </Layout>
  );
}