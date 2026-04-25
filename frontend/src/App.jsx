import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Emergency from "./pages/Emergency";
import Mechanics from "./pages/Mechanics";
import Hospitals from "./pages/Hospitals";
import Pharmacy from "./pages/Pharmacy";
import Hotels from "./pages/Hotels";
import Fuel from "./pages/Fuel";
import Contacts from "./pages/Contacts";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/mechanics" element={<Mechanics />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/fuel" element={<Fuel />} />
        <Route path="/contacts" element={<Contacts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;