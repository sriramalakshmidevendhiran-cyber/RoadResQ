import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";

export default function Pharmacy() {
  return (
    <Layout>
      <h1 className="text-green-400 mb-3">💊 Nearby Pharmacies</h1>

      <PlacesMap isHome={false} type="pharmacy" />
    </Layout>
  );
}