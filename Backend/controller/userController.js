// const User = require("../model/User.model");
// const bcrypt = require("bcryptjs");

// // ✅ Admin create karega cashier
// exports.createCashier = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     // Check agar admin hi create kar raha hai
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Only admin can create cashier." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: "cashier", // default cashier hi banega
//     });

//     await newUser.save();
//     res.status(201).json({ message: "Cashier created successfully", newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating cashier", error });
//   }
// };

// // ✅ Admin delete kar sakta hai cashier
// exports.deleteUser = async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Only admin can delete users." });
//     }

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting user", error });
//   }
// };

// // ✅ Cashier Login (Admin bhi login kar sakta hai)
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     // JWT Generate
//     const jwt = require("jsonwebtoken");
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       "your_jwt_secret",
//       { expiresIn: "1d" }
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: { id: user._id, name: user.firstName, role: user.role },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Login error", error });
//   }
// };
