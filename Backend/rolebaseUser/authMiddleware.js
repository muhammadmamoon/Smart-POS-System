const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key"; // ⚠️ env file me daalna best hai

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // user info req.user me daal do
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
