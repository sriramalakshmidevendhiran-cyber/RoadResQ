import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";

export default function Hotels() {
  return (
    <Layout>
      <h1 className="text-green-400 mb-3">🏨 Nearby Hotels</h1>

      <PlacesMap isHome={false} type="hotel" />
    </Layout>
  );
}