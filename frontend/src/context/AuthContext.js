import { createContext, useContext, useState, useEffect } from "react";

// Create Auth Context
const AuthContext = createContext();

// Custom Hook for easy usage
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // Stores logged-in user
  const [loading, setLoading] = useState(true);

  // Simulated check for authentication (replace with API call / Firebase / JWT)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("pos-user"));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    // 🔹 Example mock login
    const fakeUser = { id: 1, name: "Admin", email };
    localStorage.setItem("pos-user", JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("pos-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
