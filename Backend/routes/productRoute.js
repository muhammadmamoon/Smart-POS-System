const { Router } = require("express");
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
} = require("../controller/productcontroler.js");

const authenticateToken = require("../middleware/authMiddleware.js");

const router = Router();

// Product CRUD
router.post("/", createProduct); // Add product (Auth required)
router.get("/", getAllProducts); // Get all products
router.put("/:id", updateProduct); // Update product
router.delete("/:id", deleteProduct); // Delete single product
router.delete("/", deleteAllProducts); // Delete all products

module.exports = router;
