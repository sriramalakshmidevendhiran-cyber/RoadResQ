import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black text-white h-screen">

      <Header setIsOpen={setIsOpen} />

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="p-4">{children}</div>
    </div>
  );
}

export default Layout;