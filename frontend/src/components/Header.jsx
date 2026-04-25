import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg";
import { useEffect, useState } from "react";

function Header({ setIsOpen }) {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div
      className="relative h-16 flex items-center justify-between px-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative z-10 text-white text-xl"
      >
        ☰
      </button>

      {/* Title with animation */}
      <div className="relative z-10 text-center flex-1">

        {/* Ambulance animation */}
       

        <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="ambulance a1">🚑</div>
        <div className="ambulance a2">🚑</div>




         </div>

        <h1 className="text-green-400 font-bold text-lg">
          RoadResQ
        </h1>
      </div>

      {/* Emergency button */}
      <button
        onClick={() => navigate("/emergency")}
        className="relative z-10 bg-red-600 px-3 py-1 rounded-lg"
      >
        🚨
      </button>
    </div>
  );
}

export default Header;