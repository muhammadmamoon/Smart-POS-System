const { Router } = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController.js");  // Check the path
const authenticateToken = require("../middleware/authMiddleware.js");  // Check the path

const router = Router();

// Category CRUD routes
router.post("/", createCategory);  // Ensure createCategory is a function
router.get("/", getCategories); 
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory); 
router.delete("/:id", deleteCategory); 

module.exports = router;
