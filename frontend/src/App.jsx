import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import ReportChart from "./components/ReportChart";
import AddProduct from "./pages/AddProduct";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvoiceForm from "./pages/InvoiceForm";
import Settings from "./pages/setting";
import { SettingsProvider } from "./context/SettingsContext";
import CategoryManager from "./pages/CategoryManager";
// import AdminPanel from "./pages/UserManager";


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null); // 🔐 Auth state

  const handleLogin = (username) => {
    setUser({ name: username });
  };

  const handleLogout = () => {
    console.log("Logout Clicked!");
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <div className="App flex flex-col h-screen">
      <SettingsProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          {user ? (
            <Route
              path="/*"
              element={
                <div className="flex flex-col h-screen">
                  {/* Navbar */}
                  <Navbar
                    user={user}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onLogout={handleLogout}
                  />

                  <div className="flex flex-1">
                    {/* Sidebar */}
                    {isSidebarOpen && <Sidebar />}

                    {/* Main Content */}
                    <main className="flex-1 p-4 bg-gray-100 overflow-auto">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/addproduct" element={<AddProduct />} />
                        <Route path="/category" element={<CategoryManager />} />
                        <Route path="/invoice" element={<InvoiceForm />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/reports" element={<ReportChart />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* <Route path="/adminpanel" element={<AdminPanel/>} /> */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>

                  {/* Footer */}
                  <Footer />
                </div>
              }
            />
          ) : (
            // Agar login nahi hai → hamesha /login bhej do
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </SettingsProvider>
    </div>
  );
}

export default App;
