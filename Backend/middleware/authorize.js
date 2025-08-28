const jwt = require('jsonwebtoken');

// Protect route (Check for valid token)
exports.protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Store user data (e.g., userId, role)
    next();  // Move to next middleware or route handler
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Authorize user based on their role (admin, cashier, etc.)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();  // If user role matches, move to the next middleware/route
  };
};
