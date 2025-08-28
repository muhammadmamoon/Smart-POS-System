import { useState } from "react";
import {
  Home,
  ShoppingCart,
  Users,
  Settings,
  BarChart2,
  FileText,
  PlusCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/products", label: "Products", icon: <ShoppingCart size={20} /> },
  { to: "/addproduct", label: "Add Product", icon: <PlusCircle size={20} /> },
  { to: "/category", label: "Add Category", icon: <PlusCircle  size={20} /> },
  { to: "/invoice", label: "Invoice", icon: <FileText size={20} /> },
  { to: "/sales", label: "Sales", icon: <BarChart2 size={20} /> },
  { to: "/reports", label: "Reports", icon: <BarChart2 size={20} /> },
  { to: "/customers", label: "Customers", icon: <Users size={20} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={20} /> },
  // { to: "/adminpanel", label: "Admin", icon: <Settings size={20} /> },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { settings } = useSettings();

  return (
    <motion.div
      animate={{ width: isOpen ? 240 : 80 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col shadow-2xl relative"
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <motion.h1
          animate={{ opacity: isOpen ? 1 : 0 }}
          className="text-xl font-bold tracking-wide"
        >
          {settings.store?.name}
        </motion.h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▶
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative group
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
            >
              <div>{icon}</div>
              {isOpen && <span>{label}</span>}

              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
