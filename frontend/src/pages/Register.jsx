import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect
import axios from "axios";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate(); // ✅ initialize navigate
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (String(formData.password) !== String(formData.confirmPassword)) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const payload = {
        firstName: String(formData.firstName),
        lastName: String(formData.lastName),
        email: String(formData.email),
        password: String(formData.password),
        confirmPassword: String(formData.confirmPassword),
      };

      const response = await axios.post(
        "https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/register",
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ show popup
      alert("Registration successful!");

      // ✅ clear input fields
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // ✅ redirect to login page
      navigate("/login");

      console.log(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed!");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl"
      >
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow-md">
          Create an Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-1/2 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-1/2 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-3 font-semibold text-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl shadow-lg hover:opacity-90 transition"
          >
            Register
          </motion.button>
        </form>
        <p className="text-center text-gray-300">
          Already have an account?{" "}
          <a href="/login" className="text-pink-400 hover:underline">
            Login here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
