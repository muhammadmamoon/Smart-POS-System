"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";

/* ---------------------------- Helpers ---------------------------- */
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* ------------------------- Products Page ------------------------- */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* ---------------------- Filtering + Sorting ---------------------- */
  const filtered = useMemo(() => {
    let data = safeArray(products);

    if (search.trim()) {
      data = data.filter((p) =>
        p.productName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((p) => p.category?.name === categoryFilter);
    }

    if (minPrice) {
      data = data.filter((p) => Number(p.sellingPrice) >= Number(minPrice));
    }
    if (maxPrice) {
      data = data.filter((p) => Number(p.sellingPrice) <= Number(maxPrice));
    }

    data = [...data].sort((a, b) => {
      if (sortBy === "price") return a.sellingPrice - b.sellingPrice;
      if (sortBy === "stock") return a.stock - b.stock;
      if (sortBy === "name")
        return a.productName.localeCompare(b.productName);
      return 0;
    });

    return data;
  }, [products, search, categoryFilter, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* --------------------------- KPIs --------------------------- */
  const kpis = useMemo(() => {
    const totalProducts = filtered.length;
    const inventoryValue = safeArray(filtered).reduce(
      (s, p) => s + p.sellingPrice * p.stock,
      0
    );
    const avgPrice =
      totalProducts > 0
        ? safeArray(filtered).reduce((s, p) => s + p.sellingPrice, 0) /
          totalProducts
        : 0;
    const lowStock = filtered.filter((p) => p.stock < 5).length;

    return { totalProducts, inventoryValue, avgPrice, lowStock };
  }, [filtered]);

  /* ---------------------------- UI ---------------------------- */
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-400 via-gray-900 to-black h-screen overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl p-8 space-y-6 bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl"
      >
        <h2 className="text-3xl font-extrabold text-white text-center">
          Product Management
        </h2>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI title="Total Products" value={kpis.totalProducts} />
          <KPI title="Inventory Value" value={fmtCurrency(kpis.inventoryValue)} />
          <KPI title="Avg Price" value={fmtCurrency(kpis.avgPrice)} />
          <KPI title="Low Stock (<5)" value={kpis.lowStock} />
        </div>

        {/* Filters */}
        <div className="bg-white/10 rounded-xl shadow p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. Coke"
              className="border rounded px-3 py-2 bg-black/30 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Category</label>
            <select
              className="border rounded px-3 py-2 bg-black/30 text-white"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              {[
                ...new Set(safeArray(products).map((p) => p.category?.name)),
              ]
                .filter(Boolean)
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 bg-black/30 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 bg-black/30 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Sort By</label>
            <select
              className="border rounded px-3 py-2 bg-black/30 text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-center text-gray-300">Loading products...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-white border-collapse rounded-lg shadow-lg">
              <thead className="bg-white/20 backdrop-blur-md">
                <tr>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Purchase Price</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {paged.length > 0 ? (
                  paged.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-white/10 transition-all rounded-lg"
                    >
                      <td className="p-3">{p.sku}</td>
                      <td className="p-3">{p.productName}</td>
                      <td className="p-3">{p.category?.name || "N/A"}</td>
                      <td className="p-3 text-right">{fmtCurrency(p.purchasePrice)}</td>
                      <td className="p-3 text-right">{fmtCurrency(p.sellingPrice)}</td>
                      <td
                        className={`p-3 text-right ${
                          p.stock < 5 ? "text-red-400 font-semibold" : ""
                        }`}
                      >
                        {p.stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-center" colSpan={6}>
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded bg-white/10 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded bg-white/10 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------------------------- KPI Card ---------------------------- */
function KPI({ title, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-black/30 p-4 shadow-md text-white"
    >
      <div className="text-sm text-gray-400">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </motion.div>
  );
}
