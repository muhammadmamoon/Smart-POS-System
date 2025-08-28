"use client";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from "file-saver";

/* ------------------------- Helpers (format & math) ------------------------ */

const safeArray = (maybeArr) => (Array.isArray(maybeArr) ? maybeArr : []);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

/* --------------------- Aggregation by selected filter --------------------- */

const groupData = (invoices, filter) => {
  const grouped = new Map();

  for (const invoice of safeArray(invoices)) {
    const hasDate = !!invoice?.date_time;
    const net = Number(invoice?.net_total || 0);

    // Product-wise: sum by item name
    if (filter === "product") {
      for (const item of safeArray(invoice.items)) {
        const key = item?.name || "Unknown";
        const prev = grouped.get(key) || 0;
        grouped.set(key, prev + Number(item?.total || 0));
      }
      continue;
    }

    if (!hasDate) continue;
    const d = new Date(invoice.date_time);

    let key;
    switch (filter) {
      case "daily":
        key = d.toLocaleDateString("en-US", { weekday: "short" });
        break;
      case "weekly": {
        const wk = Math.ceil(d.getDate() / 7);
        const m = d.toLocaleDateString("en-US", { month: "short" });
        key = `${m} W${wk}`;
        break;
      }
      case "monthly":
        key = d.toLocaleDateString("en-US", { month: "short" });
        break;
      case "yearly":
        key = String(d.getFullYear());
        break;
      default:
        key = d.toLocaleDateString("en-US");
    }

    const prev = grouped.get(key) || 0;
    grouped.set(key, prev + net);
  }

  return Array.from(grouped.entries()).map(([name, sales]) => ({ name, sales }));
};

/* ------------------------------ CSV builders ----------------------------- */

const buildAggregatedCSV = (chartData, label) => {
  const rows = [["Label", "Sales"]];
  chartData.forEach((r) => rows.push([r.name, r.sales]));
  return toCSVBlob(rows, `${label}_aggregated_report.csv`);
};

const buildDetailedCSV = (invoices) => {
  const rows = [["Invoice Number", "Product Name", "Quantity", "Net Total", "Selling Date"]];
  safeArray(invoices).forEach((inv) => {
    const date = inv?.date_time ? new Date(inv.date_time).toLocaleString() : "";
    safeArray(inv.items).forEach((item) => {
      rows.push([
        inv?.invoice_number || "",
        item?.name || "",
        Number(item?.quantity || 0),
        Number(inv?.net_total || 0),
        date,
      ]);
    });
  });
  return toCSVBlob(rows, "detailed_sales_report.csv");
};

const toCSVBlob = (rows, filename) => {
  const text = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
  return { blob: new Blob([text], { type: "text/csv;charset=utf-8;" }), filename };
};

const escapeCSV = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/* ------------------------------- Component -------------------------------- */

export default function ReportChart() {
  const [filter, setFilter] = useState("daily");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/invoice/", {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        if (isMounted) setInvoices(list);
      } catch (e) {
        if (isMounted) setErr("Failed to load invoices. Check server/CORS.");
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(() => groupData(invoices, filter), [invoices, filter]);

  const kpis = useMemo(() => {
    const totalRevenue = safeArray(invoices).reduce(
      (s, inv) => s + Number(inv?.net_total || 0),
      0
    );
    const invoiceCount = safeArray(invoices).length || 0;

    const productTotals = new Map();
    safeArray(invoices).forEach((inv) => {
      safeArray(inv.items).forEach((it) => {
        const key = it?.name || "Unknown";
        productTotals.set(key, (productTotals.get(key) || 0) + Number(it?.total || 0));
      });
    });
    const topProduct =
      Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      totalRevenue,
      invoiceCount,
      avgInvoice: invoiceCount ? totalRevenue / invoiceCount : 0,
      topProduct,
    };
  }, [invoices]);

  const onDownloadAggregated = () => {
    const { blob, filename } = buildAggregatedCSV(chartData, filter);
    saveAs(blob, filename);
  };

  const onDownloadDetailed = () => {
    const { blob, filename } = buildDetailedCSV(invoices);
    saveAs(blob, filename);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto h-screen bg-gradient-to-br from-gray-400 via-gray-900 to-black p-6 space-y-6">
      {/* Header + Filter + Actions */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-white tracking-wide">📊 Sales Report</h2>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="px-3 py-2 rounded-lg bg-gray-900/60 text-white border border-white/20"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="product">Product Wise</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={onDownloadAggregated}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Download Aggregated CSV
              </button>
              <button
                onClick={onDownloadDetailed}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Download Detailed CSV
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <KPI title="Total Revenue" value={fmtCurrency(kpis.totalRevenue)} />
          <KPI title="Invoices" value={kpis.invoiceCount} />
          <KPI title="Avg / Invoice" value={fmtCurrency(kpis.avgInvoice)} />
          <KPI title="Top Product" value={kpis.topProduct} />
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6 w-full">
        {loading ? (
          <p className="text-gray-300">Loading report…</p>
        ) : err ? (
          <p className="text-red-400">{err}</p>
        ) : chartData.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                formatter={(v) => fmtCurrency(Number(v))}
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 5, fill: "#6366F1", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">No data available</p>
        )}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6 w-full">
        <h3 className="text-lg font-semibold mb-3 text-white">Recent Invoices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-white/10">
              <tr>
                <th className="text-left p-2">Invoice #</th>
                <th className="text-left p-2">Products</th>
                <th className="text-right p-2">Net Total</th>
                <th className="text-left p-2">Payment</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {safeArray(invoices)
                .slice()
                .reverse()
                .slice(0, 8)
                .map((inv) => (
                  <tr key={inv._id} className="border-b border-white/10">
                    <td className="p-2 font-medium">{inv.invoice_number}</td>
                    <td className="p-2">
                      {safeArray(inv.items).map((it) => (
                        <div key={it._id}>
                          {it.name} × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="p-2 text-right font-semibold">{fmtCurrency(inv.net_total)}</td>
                    <td className="p-2">{inv.payment_method}</td>
                    <td className="p-2">
                      {inv.date_time ? new Date(inv.date_time).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              {!invoices?.length && (
                <tr>
                  <td className="p-3 text-center text-gray-400" colSpan={5}>
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- UI Bits -------------------------------- */

function KPI({ title, value }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4 shadow">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
