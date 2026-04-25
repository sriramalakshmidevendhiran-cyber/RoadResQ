import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";

export default function Hospitals() {
  return (
    <Layout>
      <h1 className="text-green-400 text-lg mb-2">
        🏥 Nearby Hospitals
      </h1>

      <PlacesMap isHome={false} type="hospital" />
    </Layout>
  );
}