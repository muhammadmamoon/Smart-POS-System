const express = require("express");
const router = express.Router();
const userController = require("./userController");
const authMiddleware = require("../middleware/authMiddleware");

// Create user (signup)
router.post("/createusers/users", userController.createUser);

// Login user
router.post("/users/login", userController.loginUser);

// Get all users (protected)
router.get("/createusers/users",  userController.getUsers);

module.exports = router;
