const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/User.model');  // Assuming you have a User model

// 📌 Login Controller to verify user and issue JWT token
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT token based on role
    const payload = {
      userId: user._id,
      role: user.role,  // "admin", "cashier", etc.
    };

    // 4. Issue JWT Token (expires in 1 hour)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 5. Send back the token to client
    res.json({
      message: 'Login successful',
      token,  // Send JWT token to frontend
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
