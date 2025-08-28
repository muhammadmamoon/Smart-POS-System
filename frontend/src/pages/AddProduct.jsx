"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import Papa from "papaparse"; // CSV parsing

/* -------------------- Reusable Input Components -------------------- */
const InputField = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  readOnly = false,
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 
      focus:outline-none focus:ring-2 focus:ring-pink-500 transition shadow-sm"
  />
);

const TextAreaField = ({ name, value, onChange, placeholder, rows = 3 }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 
      focus:outline-none focus:ring-2 focus:ring-pink-500 transition shadow-sm"
  />
);

export default function AddProduct() {
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  const [form, setForm] = useState({
    productName: "",
    category: "",
    sku: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    description: "",
    imageUrl: "",
    barcodeImage: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csvProducts, setCsvProducts] = useState([]);

  /* -------------------- Check Login -------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Unauthorized",
        text: "You must be logged in to add a product.",
      }).then(() => navigate("/login"));
    }
  }, [navigate]);

  /* -------------------- Fetch Categories -------------------- */
  useEffect(() => {
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };
  fetchCategories();
}, []);

  /* -------------------- Handlers -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-generate SKU when category changes
    if (name === "category") {
      const catCode = value ? value.substring(0, 4).toUpperCase() : "PRD";
      setForm((prev) => ({ ...prev, sku: `${catCode}-${Date.now()}` }));
    }
  };

  const generateBarcode = async (sku) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, sku, { format: "CODE128" });
    const dataUrl = canvas.toDataURL("image/png");
    setForm((prev) => ({ ...prev, barcodeImage: dataUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await generateBarcode(form.sku);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      Swal.fire({
        icon: "success",
        title: "Product Added Successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      setForm({
        productName: "",
        category: "",
        sku: "",
        purchasePrice: "",
        sellingPrice: "",
        stock: "",
        description: "",
        imageUrl: "",
        barcodeImage: "",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- CSV Upload -------------------- */
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvProducts(results.data);
      },
    });
  };

const handleBulkUpload = async () => {
  if (csvProducts.length === 0) {
    return Swal.fire("No Data", "Upload a CSV file first", "warning");
  }
   // Create lookup map: { "Cosmetics": "6899d6bc..." }
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.name.toLowerCase()] = c._id;
  });
    // Replace category name with ID
  const productsWithIds = csvProducts.map((p) => {
    const categoryId = categoryMap[p.category.toLowerCase()];
    if (!categoryId) {
      throw new Error(`Category "${p.category}" not found in system`);
    }
    return { ...p, category: categoryId };
  });

  const token = localStorage.getItem("token");
   try {
    setLoading(true);
    const res = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productsWithIds),
    });

    if (!res.ok) throw new Error("Bulk upload failed");
    Swal.fire("Success", "CSV products uploaded successfully!", "success");
    setCsvProducts([]);
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  } finally {
    setLoading(false);
  }
};


  /* -------------------- Render -------------------- */
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 via-gray-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl p-8 space-y-6 bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20"
      >
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow">
          Add Product
        </h2>

        {/* CSV Upload Section */}
        <div className="bg-white/10 border border-white/20 p-6 rounded-xl text-white space-y-4 shadow-inner">
          <h3 className="text-lg font-semibold">📂 Bulk Upload via CSV</h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="block w-full text-sm text-gray-200"
          />
          {csvProducts.length > 0 && (
            <div>
              <p className="text-sm text-gray-300">
                {csvProducts.length} products ready to upload
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkUpload}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                Upload All
              </motion.button>
            </div>
          )}
        </div>

        {/* Manual Product Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <InputField
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="Product Name"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white focus:outline-none 
              focus:ring-2 focus:ring-pink-500 transition shadow-sm"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="text-black">
                {c.name}
              </option>
            ))}
          </select>

          <InputField name="sku" value={form.sku} placeholder="SKU" readOnly />

          <InputField
            type="number"
            name="purchasePrice"
            value={form.purchasePrice}
            onChange={handleChange}
            placeholder="Purchase Price"
            required
          />

          <InputField
            type="number"
            name="sellingPrice"
            value={form.sellingPrice}
            onChange={handleChange}
            placeholder="Selling Price"
            required
          />

          <InputField
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
            required
          />

          <TextAreaField
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
          />

          <InputField
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Image URL"
          />

          {/* Image Preview */}
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg md:col-span-2"
            />
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`col-span-2 w-full px-4 py-3 font-semibold text-lg text-white 
              bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl shadow-lg 
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Adding..." : "➕ Add Product"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
