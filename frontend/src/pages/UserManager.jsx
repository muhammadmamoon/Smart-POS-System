import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [user, setUser] = useState({ username: "", role: "", password: "", link: "" });
  const [users, setUsers] = useState([]);

  // Role → Route mapping
  const roleRoutes = {
    cashier: "http://localhost:5173/invoice",
    "inventory-manager": "http://localhost:5173/addproduct",
    "category-manager": "http://localhost:5173/category",
    "product-manager": "http://localhost:5173/addproduct",
  };

  // ✅ Fetch all users from backend
  useEffect(() => {
    axios
      .get("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/createusers/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // ✅ Create user and save to backend
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!user.username || !user.role || !user.password) {
      return alert("Please fill all fields");
    }

    // Auto assign link based on role
    const roleLink = roleRoutes[user.role] || "";

    try {
      const res = await axios.post("http://localhost:3000/api/createusers/users", {
        username: user.username,
        role: user.role,
        password: user.password,
        link: roleLink,
      });

      // ✅ Backend se jo user return hoga usko state me add karna
      setUsers([...users, res.data.user]);
      setUser({ username: "", role: "", password: "", link: "" });
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Create User</h2>
      <form onSubmit={handleCreateUser} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          className="w-full border p-2 rounded"
        />

        {/* Role dropdown */}
        <select
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Role</option>
          <option value="cashier">Cashier</option>
          <option value="inventory-manager">Inventory Manager</option>
          <option value="category-manager">Category Manager</option>
          <option value="product-manager">Product Manager</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Create User
        </button>
      </form>

      <h3 className="font-semibold mb-2">User List</h3>
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li key={i} className="flex flex-col bg-gray-100 p-2 rounded">
            <span><b>Username:</b> {u.username}</span>
            <span><b>Role:</b> {u.role}</span>
            {/* 🚨 Security note: password show na karna production me */}
            <span><b>Password:</b> {u.password}</span> 
            {u.link && (
              <a
                href={u.link}
                className="text-blue-500 underline"
                target="_blank"
                rel="noreferrer"
              >
                Access Link
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
