const bcrypt = require('bcrypt');
const User = require('../model/User.model');
const jwt = require('jsonwebtoken');

const registercontroller = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  try {
    // check confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = registercontroller;
