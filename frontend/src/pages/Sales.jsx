"use client";
import { useEffect, useState, useMemo } from "react";

/* ---------------------------- Helpers ---------------------------- */
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* ---------------------------- Component ---------------------------- */
export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date | total | invoice

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Fetch invoices
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/invoice/");
        if (!res.ok) throw new Error("Failed to fetch sales data");

        const json = await res.json();
        setSales(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        console.error("Error fetching sales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  /* ---------------------- Filtering + Sorting ---------------------- */
  const filtered = useMemo(() => {
    let data = safeArray(sales);

    // Search by product name
    if (search.trim()) {
      data = data.filter((inv) =>
        safeArray(inv.items).some((it) =>
          it?.name?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      data = data.filter((inv) => inv.payment_method === paymentFilter);
    }

    // Price range
    if (minPrice) {
      data = data.filter((inv) => Number(inv.net_total) >= Number(minPrice));
    }
    if (maxPrice) {
      data = data.filter((inv) => Number(inv.net_total) <= Number(maxPrice));
    }

    // Sorting
    data = [...data].sort((a, b) => {
      if (sortBy === "date")
        return new Date(b.date_time) - new Date(a.date_time);
      if (sortBy === "total") return b.net_total - a.net_total;
      if (sortBy === "invoice")
        return (b.invoice_number || 0) - (a.invoice_number || 0);
      return 0;
    });

    return data;
  }, [sales, search, paymentFilter, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* --------------------------- KPIs --------------------------- */
  const kpis = useMemo(() => {
    const totalRevenue = safeArray(filtered).reduce(
      (s, inv) => s + Number(inv.net_total || 0),
      0
    );
    const invoiceCount = filtered.length;
    const avgInvoice = invoiceCount ? totalRevenue / invoiceCount : 0;

    // Top product
    const productTotals = new Map();
    filtered.forEach((inv) =>
      safeArray(inv.items).forEach((it) => {
        productTotals.set(
          it.name,
          (productTotals.get(it.name) || 0) + Number(it.total || 0)
        );
      })
    );
    const topProduct =
      Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "—";

    return { totalRevenue, invoiceCount, avgInvoice, topProduct };
  }, [filtered]);

  /* ---------------------------- UI ---------------------------- */
  if (loading) {
    return <p className="p-6 text-gray-200">Loading sales data...</p>;
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-400 via-gray-900 to-black min-h-screen rounded-lg shadow-xl">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total Revenue" value={fmtCurrency(kpis.totalRevenue)} />
        <KPI title="Invoices" value={kpis.invoiceCount} />
        <KPI title="Avg / Invoice" value={fmtCurrency(kpis.avgInvoice)} />
        <KPI title="Top Product" value={kpis.topProduct} />
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow p-4 flex flex-wrap gap-4 items-end text-gray-200">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Search Product</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. Burger"
            className="border bg-black/30 text-gray-100 rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Payment</label>
          <select
            className="border bg-black/30 text-gray-100 rounded px-3 py-2"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="EasyPaisa">EasyPaisa</option>
            <option value="JazzCash">JazzCash</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Min Price</label>
          <input
            type="number"
            className="border bg-black/30 text-gray-100 rounded px-3 py-2"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Max Price</label>
          <input
            type="number"
            className="border bg-black/30 text-gray-100 rounded px-3 py-2"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Sort By</label>
          <select
            className="border bg-black/30 text-gray-100 rounded px-3 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="total">Total</option>
            <option value="invoice">Invoice #</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden text-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-white/20 text-gray-100">
            <tr>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-right">Net Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((s) => (
                <tr key={s._id} className="hover:bg-white/10 border-b border-white/20">
                  <td className="p-3 font-medium">{s.invoice_number}</td>
                  <td className="p-3">
                    {safeArray(s.items).map((it) => (
                      <div key={it._id}>
                        {it.name} × {it.quantity} — {fmtCurrency(it.total)}
                      </div>
                    ))}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {fmtCurrency(s.net_total)}
                  </td>
                  <td className="p-3">{s.payment_method}</td>
                  <td className="p-3">
                    {s.date_time
                      ? new Date(s.date_time).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-gray-300" colSpan={5}>
                  No sales found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 text-gray-200">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-white/10 hover:bg-white/20"
          >
            Prev
          </button>
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-white/10 hover:bg-white/20"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- KPI Card ---------------------------- */
function KPI({ title, value }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-lg p-4 shadow-sm border border-white/20">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-100">{value}</div>
    </div>
  );
}
