import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full m-auto py-[0.5rem] px-[14rem] flex flex-row items-center justify-between">
      {/* logo */}
      <div className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-500">Thermalytics</div>
      <div className="flex flex-row items-center gap-5 text-gray-700 text-sm font-medium">
        <Link to={"/"}>
          <div className="hover:text-blue-500">Home</div>
        </Link>
        <Link to={"/service"}>
          <div className="hover:text-blue-500">Service</div>
        </Link>
        <Link to={"/service"}>
          <button className="hover:bg-blue-700 bg-blue-500 rounded-full w-[100%] text-white py-2 px-4">Try Now</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
