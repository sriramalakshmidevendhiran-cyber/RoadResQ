import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 GET USER FROM LOCALSTORAGE
  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { name: "Home", path: "/home", icon: "🏠" },
    { name: "Mechanics", path: "/mechanics", icon: "🔧" },
    { name: "Hospitals", path: "/hospitals", icon: "🏥" },
    { name: "Pharmacy", path: "/pharmacy", icon: "💊" },
    { name: "Hotels", path: "/hotels", icon: "🏨" },
    { name: "Fuel", path: "/fuel", icon: "⛽" },
    { name: "Contacts", path: "/contacts", icon: "📞" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-5 border-b border-green-500">
          <h2 className="text-green-400 text-xl font-bold">🚑 RoadResQ</h2>

          {/* 🔥 FIXED EMAIL */}
          <p className="text-gray-400 text-sm">
            {user?.email || "No user"}
          </p>
        </div>

        {/* Menu */}
        <div className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  location.pathname === item.path
                    ? "bg-green-600 text-black"
                    : "hover:bg-green-600 hover:text-black"
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-green-500">
          <button
            onClick={() => {
              localStorage.clear(); // 🔥 IMPORTANT (clear user also)
              navigate("/");
            }}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;