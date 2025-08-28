"use client";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import useSWR, { useSWRConfig } from "swr";
import { motion } from "framer-motion";
import { Users, ShoppingBag, DollarSign, AlertTriangle, RotateCw } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ----------------- Helpers ----------------- */
const fetcher = (url) => axios.get(url).then((res) => res.data);

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const candidates = ["data", "items", "result", "results", "products", "invoices", "purchases"];
  for (const key of candidates) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* ----------------- Reusable UI ----------------- */
function KPI({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-5 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-300">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>
      </div>
    </motion.div>
  );
}

function Card({ title, right, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
    >
      <div className="px-6 pt-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white drop-shadow">{title}</h2>
        {right}
      </div>
      <div className="p-6 text-gray-200">{children}</div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white/10 h-24 shadow" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-white/10" />
        <div className="h-80 rounded-2xl bg-white/10" />
      </div>
      <div className="h-64 rounded-2xl bg-white/10" />
    </div>
  );
}

/* ----------------- Dashboard ----------------- */
export default function Dashboard() {
  const { mutate } = useSWRConfig();

  const { data: invRaw, isLoading: invoicesLoading } = useSWR(
    "http://localhost:3000/api/invoice/",
    fetcher
  );
  const { data: prodRaw, isLoading: productsLoading } = useSWR(
    "http://localhost:3000/api/products",
    fetcher
  );
  const { data: custRaw, isLoading: customersLoading } = useSWR(
    "http://localhost:3000/api/purchases",
    fetcher
  );

  const invoices = toArray(invRaw);
  const products = toArray(prodRaw);
  const customers = toArray(custRaw);
  const loading = invoicesLoading || productsLoading || customersLoading;

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredInvoices = useMemo(() => {
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    return invoices.filter((inv) => {
      const dt = new Date(inv.date_time || inv.date || inv.createdAt || Date.now());
      if (from && dt < from) return false;
      if (to && dt > to) return false;
      return true;
    });
  }, [invoices, dateRange]);

  const totalRevenue = useMemo(
    () => filteredInvoices.reduce((s, inv) => s + (Number(inv.net_total ?? inv.total ?? 0)), 0),
    [filteredInvoices]
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => Number(p?.stock ?? 0) < 5).length,
    [products]
  );

  const stats = [
    {
      label: "Total Revenue",
      value: fmtCurrency(totalRevenue),
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      label: "Products",
      value: products.length,
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      label: "Customers",
      value: customers.length,
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ];

  const allCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const name = typeof p.category === "string" ? p.category : p.category?.name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [products]);

  const salesByDate = useMemo(() => {
    const map = {};
    filteredInvoices.forEach((inv) => {
      const d = new Date(inv.date_time || inv.date || inv.createdAt || Date.now()).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short" }
      );
      map[d] = (map[d] || 0) + Number(inv.net_total ?? inv.total ?? 0);
    });
    return Object.entries(map).map(([date, value]) => ({ date, value }));
  }, [filteredInvoices]);

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const name = typeof p.category === "string" ? p.category : p.category?.name;
      if (!name) return;
      if (categoryFilter !== "all" && name !== categoryFilter) return;
      const value = Number(p?.sellingPrice ?? 0) * Number(p?.stock ?? 0);
      map[name] = (map[name] || 0) + value;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products, categoryFilter]);

  const recentSales = useMemo(
    () => [...filteredInvoices].sort((a, b) => new Date(b.date_time || b.date || b.createdAt) - new Date(a.date_time || a.date || a.createdAt)).slice(0, 6),
    [filteredInvoices]
  );

  const COLORS = ["#ec4899", "#a855f7", "#3b82f6", "#22c55e", "#eab308", "#ef4444"];

  const refreshAll = () => {
    mutate("http://localhost:3000/api/invoice/");
    mutate("http://localhost:3000/api/products");
    mutate("http://localhost:3000/api/purchases");
  };

  useEffect(() => {
    refreshAll();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-400 via-gray-900 to-black h-screen overflow-y-auto">
      {/* Header + Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">Dashboard</h1>
          <p className="text-sm text-gray-300">Overview of sales & inventory</p>
        </div>
        <motion.button
          onClick={refreshAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 shadow-lg"
        >
          <RotateCw className="w-4 h-4" />
          Refresh
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <KPI key={i} title={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Filters */}
      <Card
        title="Filters"
        right={
          <button
            onClick={() => {
              setDateRange({ from: "", to: "" });
              setCategoryFilter("all");
            }}
            className="text-sm px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
          >
            Reset
          </button>
        }
      >
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
              className="border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
              className="border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div className="max-w-xs">
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 w-full"
            >
              <option value="all">All</option>
              {allCategories.map((c) => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Overview">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }} />
              <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Inventory Value by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} label>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card title="Recent Sales">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="p-3 text-left">Invoice #</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/10">
                  <td className="p-3">{s.invoice_number || s._id || "N/A"}</td>
                  <td className="p-3">
                    {new Date(s.date_time || s.date || s.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">{fmtCurrency(s.net_total ?? s.total ?? 0)}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">
                    No recent sales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
