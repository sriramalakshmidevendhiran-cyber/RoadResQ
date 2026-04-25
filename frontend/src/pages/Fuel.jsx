import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";

export default function Fuel() {
  return (
    <Layout>
      <h1 className="text-green-400 mb-3">⛽ Nearby Fuel Stations</h1>

      <PlacesMap isHome={false} type="petrol station" />
    </Layout>
  );
}