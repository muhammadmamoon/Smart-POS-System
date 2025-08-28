"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ChevronRight, ChevronDown } from "lucide-react";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // ✅ Track expand/collapse state

  // Load categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  // Add or Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Error", "Category name is required", "error");
      return;
    }

    try {
      let res;
      if (editingCategory) {
        res = await fetch(
          `http://localhost:3000/api/categories/${editingCategory._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              parentCategory: parentCategory || null,
            }),
          }
        );
      } else {
        res = await fetch("http://localhost:3000/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            parentCategory: parentCategory || null,
          }),
        });
      }

      if (res.ok) {
        Swal.fire(
          editingCategory ? "Updated!" : "Added!",
          `Category ${editingCategory ? "updated" : "added"} successfully`,
          "success"
        );
        setEditingCategory(null);
        setName("");
        setParentCategory("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  // Edit Category
  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentCategory(cat.parentCategory?._id || "");
  };

  // Delete Category
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting this category will also remove its subcategories!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `http://localhost:3000/api/categories/${id}`,
            { method: "DELETE" }
          );
          if (res.ok) {
            Swal.fire("Deleted!", "Category deleted successfully", "success");
            fetchCategories();
          }
        } catch (error) {
          console.error("Error deleting category", error);
        }
      }
    });
  };

  // Toggle expand/collapse
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive Tree View
  const renderCategoryTree = (cats, parent = null, level = 0) => {
    return cats
      .filter((c) => (c.parentCategory?._id || null) === parent)
      .map((cat) => {
        const hasChildren = cats.some(
          (child) => child.parentCategory?._id === cat._id
        );
        const isExpanded = expanded[cat._id];

        return (
          <div key={cat._id} style={{ marginLeft: level * 20 }}>
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-lg p-2 my-1 shadow-md">
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  <button onClick={() => toggleExpand(cat._id)}>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-white" />
                    ) : (
                      <ChevronRight size={16} className="text-white" />
                    )}
                  </button>
                ) : (
                  <span className="w-4"></span>
                )}
                <span className="font-semibold text-white">{cat.name}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Show children if expanded */}
            {isExpanded && renderCategoryTree(cats, cat._id, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-400 via-gray-900 to-black text-white">
      <h2 className="text-2xl font-bold mb-6">📂 Category Management</h2>

      {/* Add / Edit Category Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg flex flex-wrap gap-4"
      >
        <input
          type="text"
          placeholder="Enter category name"
          className="border border-gray-600 bg-gray-800 text-white p-2 rounded-lg flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border border-gray-600 bg-gray-800 text-white p-2 rounded-lg"
          value={parentCategory}
          onChange={(e) => setParentCategory(e.target.value)}
        >
          <option value="">No Parent</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          {editingCategory ? "Update" : "Add"}
        </button>
      </form>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search categories..."
        className="border border-gray-600 bg-gray-800 text-white p-2 rounded-lg mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-400">Loading categories...</p>
      ) : (
        <div className="space-y-1">{renderCategoryTree(categories)}</div>
      )}
    </div>
  );
};

export default CategoryManager;
