// src/components/Navbar.jsx
import React from "react";
import { FiMenu, FiLogOut, FiUser } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";

const Navbar = ({ onToggleSidebar, onLogout, user }) => {
  const { settings } = useSettings();
  return (
    <nav className="bg-gray-900 text-white shadow-md w-full px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="text-xl md:hidden focus:outline-none"
        >
          <FiMenu />
        </button>
        <h1 className="text-lg font-bold tracking-wide">{settings.store?.name}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-5">
        <span className="hidden md:inline text-sm">
          {user?.name || "Guest"}
        </span>
        <FiUser className="text-lg cursor-pointer hover:text-gray-400" />

        <button
          onClick={onLogout}
          className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition"
        >
          <FiLogOut className="mr-1" /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
