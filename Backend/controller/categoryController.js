const Category = require("../model/Category");

// 📌 Create Category (Main or Sub-category)
const createCategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = new Category({
      name: name.trim(),
      parentCategory: parentCategory || null
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get All Categories (with parent details)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory", "name") // Show only parent name
      .sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get Single Category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("parentCategory", "name");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Update Category
const updateCategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) {
      // Check duplicate (except current category itself)
      const duplicate = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({ message: "Category name already exists" });
      }
      category.name = name.trim();
    }

    category.parentCategory = parentCategory || null;

    await category.save();

    res.json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Delete Category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
