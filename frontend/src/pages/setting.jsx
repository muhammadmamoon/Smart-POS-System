"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Percent,
  Shield,
  Database,
  Globe,
  Wallet,
  Bell,
  Download,
  Upload,
  Save,
  RefreshCw,
  Users,
  KeyRound,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
// ───────────────────────────── Config ─────────────────────────────
const USE_API = false; // set true if your backend endpoints exist
const SETTINGS_KEY = "pos_settings_v1";

const DEFAULTS = {
  store: {
    name: "Smart POS",
    phone: "0300-0000000",
    address: "Karachi, Pakistan",
    logo: "",
  },
  theme: {
    mode: "dark",
    accent: "indigo",
    currency: "PKR",
    dateFormat: "DD/MM/YYYY",
  },
  taxDiscount: { taxPct: 5, allowGlobalDiscount: true, maxDiscountPct: 50 },
  payments: {
    enabled: ["Cash", "Card", "EasyPaisa", "JazzCash"],
    defaultMethod: "Cash",
  },

  security: { requirePinToRefund: true },
};

// Small helpers
const safe = (v, f) => (v === undefined || v === null ? f : v);
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};
const save = (data) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));

// Simple toast
function Toast({ text, type = "success", onClose }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 shadow-xl border
        ${
          type === "error"
            ? "bg-red-600/90 border-red-400 text-white"
            : "bg-emerald-600/90 border-emerald-400 text-white"
        }`}
    >
      <div className="flex items-center gap-2">
        {type === "error" ? <Shield size={18} /> : <Save size={18} />}
        <span className="text-sm font-medium">{text}</span>
        <button
          className="ml-2/ text-white/80 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// Tag
const Chip = ({ children }) => (
  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
    {children}
  </span>
);

// Button
function Btn({ children, className = "", icon: Icon, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white shadow-sm transition ${className}`}
    >
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

// Card shell
function Card({ title, icon: Icon, actions, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 p-5 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="opacity-80" />}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
      {children}
    </motion.div>
  );
}

// Input
function Field({ label, hint, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm text-gray-200">{label}</span>
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

// Textarea
function Area({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-200">{label}</span>
      <textarea
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

// Toggle
function Toggle({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15"
      type="button"
    >
      <span className="text-sm text-gray-200">{label}</span>
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-gray-600"
        }`}
      >
        <span
          className={`h-5 w-5 bg-white rounded-full transform transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

// Select
function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-200">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {children}
      </select>
    </label>
  );
}

// Section tabs
const TABS = [
  { key: "store", label: "Store", icon: Store },
  { key: "tax", label: "Tax & Discounts", icon: Percent },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "security", label: "Security", icon: Shield },
  { key: "data", label: "Backup & Data", icon: Database },
];

// ───────────────────────────── Component ─────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState("store");
  const { settings, setSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  // Load settings (localStorage or API)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (USE_API) {
          const r = await fetch("/api/settings");
          if (r.ok) {
            const s = await r.json();
            if (mounted) setSettings({ ...DEFAULTS, ...s });
          } else {
            if (mounted) setSettings(load());
          }
        } else {
          if (mounted) setSettings(load());
        }
      } catch {
        if (mounted) setSettings(load());
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loading) save(settings);
  }, [settings, loading]);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const saveAll = async () => {
    try {
      if (USE_API) {
        const r = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (!r.ok) throw new Error("API error");
      }
      save(settings);
      notify("Settings saved");
    } catch (e) {
      console.error(e);
      notify("Failed to save", "error");
    }
  };

  const resetDefaults = () => {
    setSettings(DEFAULTS);
    notify("Reset to defaults");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pos-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setSettings({ ...DEFAULTS, ...parsed });
        notify("Settings imported");
      } catch {
        notify("Invalid JSON file", "error");
      }
      fileRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // ────────────── Sections ──────────────
  const StoreSection = () => (
    <Card title="Store Information" icon={Store}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Store Name"
          value={settings.store.name}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              store: { ...s.store, name: e.target.value },
            }))
          }
        />
        <Field
          label="Phone"
          value={settings.store.phone}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              store: { ...s.store, phone: e.target.value },
            }))
          }
        />
        <Field
          label="Logo URL"
          value={settings.store.logo}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              store: { ...s.store, logo: e.target.value },
            }))
          }
        />
        <Area
          label="Address"
          rows={3}
          value={settings.store.address}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              store: { ...s.store, address: e.target.value },
            }))
          }
        />
      </div>
    </Card>
  );

  //   const AppearanceSection = () => (
  //     <Card title="Appearance & Locale" icon={Palette}>
  //       <div className="grid sm:grid-cols-3 gap-4">
  //         <Select label="Theme"
  //                 value={settings.theme.mode}
  //                 onChange={(v) => setSettings(s => ({ ...s, theme: { ...s.theme, mode: v } }))}>
  //           <option value="dark">Dark</option>
  //           <option value="light">Light</option>
  //           <option value="gradient">Gradient</option>
  //         </Select>
  //         <Select label="Accent"
  //                 value={settings.theme.accent}
  //                 onChange={(v) => setSettings(s => ({ ...s, theme: { ...s.theme, accent: v } }))}>
  //           {["indigo", "violet", "emerald", "rose", "amber", "sky"].map(c => (
  //             <option key={c} value={c}>{c}</option>
  //           ))}
  //         </Select>
  //         <Select label="Currency"
  //                 value={settings.theme.currency}
  //                 onChange={(v) => setSettings(s => ({ ...s, theme: { ...s.theme, currency: v } }))}>
  //           <option>PKR</option><option>USD</option><option>AED</option><option>SAR</option>
  //         </Select>
  //         <Select label="Date Format"
  //                 value={settings.theme.dateFormat}
  //                 onChange={(v) => setSettings(s => ({ ...s, theme: { ...s.theme, dateFormat: v } }))}>
  //           <option>DD/MM/YYYY</option>
  //           <option>MM/DD/YYYY</option>
  //           <option>YYYY-MM-DD</option>
  //         </Select>
  //       </div>
  //     </Card>
  //   );

  const TaxSection = () => (
    <Card title="Tax & Discount Rules" icon={Percent}>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field
          type="number"
          label="Tax (%)"
          value={settings.taxDiscount.taxPct}
          onChange={(e) => {
            const v = Math.max(0, Number(e.target.value));
            setSettings((s) => ({
              ...s,
              taxDiscount: { ...s.taxDiscount, taxPct: v },
            }));
          }}
        />
        <Toggle
          label="Allow Global Discount"
          checked={settings.taxDiscount.allowGlobalDiscount}
          onChange={(v) =>
            setSettings((s) => ({
              ...s,
              taxDiscount: { ...s.taxDiscount, allowGlobalDiscount: v },
            }))
          }
        />
        <Field
          type="number"
          label="Max Discount (%)"
          value={settings.taxDiscount.maxDiscountPct}
          onChange={(e) => {
            const v = Math.min(100, Math.max(0, Number(e.target.value)));
            setSettings((s) => ({
              ...s,
              taxDiscount: { ...s.taxDiscount, maxDiscountPct: v },
            }));
          }}
        />
      </div>
    </Card>
  );

  //   const ReceiptSection = () => (
  //     <Card title="Receipt Configuration" icon={Receipt}>
  //       <div className="grid sm:grid-cols-2 gap-4">
  //         <Toggle label="Show Store Logo" checked={settings.receipt.showLogo}
  //                 onChange={(v) => setSettings(s => ({ ...s, receipt: { ...s.receipt, showLogo: v } }))}/>
  //         <Field label="Header Note" value={settings.receipt.headerNote}
  //                onChange={(e) => setSettings(s => ({ ...s, receipt: { ...s.receipt, headerNote: e.target.value } }))}/>
  //         <Area label="Footer Note" rows={3} value={settings.receipt.footerNote}
  //               onChange={(e) => setSettings(s => ({ ...s, receipt: { ...s.receipt, footerNote: e.target.value } }))}/>
  //       </div>
  //     </Card>
  //   );

  const PaymentsSection = () => {
    const all = ["Cash", "Card", "EasyPaisa", "JazzCash", "Bank"];
    const toggleMethod = (m) =>
      setSettings((s) => {
        const set = new Set(s.payments.enabled);
        set.has(m) ? set.delete(m) : set.add(m);
        const arr = Array.from(set);
        const defaultMethod = arr.includes(s.payments.defaultMethod)
          ? s.payments.defaultMethod
          : arr[0] || "";
        return {
          ...s,
          payments: { ...s.payments, enabled: arr, defaultMethod },
        };
      });
    return (
      <Card title="Payment Methods" icon={Wallet}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <div className="text-sm text-gray-200">Enable Methods</div>
            <div className="flex flex-wrap gap-2">
              {all.map((m) => (
                <button
                  key={m}
                  className={`px-3 py-1 rounded-full border ${
                    settings.payments.enabled.includes(m)
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                      : "bg-black/30 border-white/15 text-gray-200"
                  }`}
                  onClick={() => toggleMethod(m)}
                  type="button"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Default Method"
            value={settings.payments.defaultMethod}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                payments: { ...s.payments, defaultMethod: v },
              }))
            }
          >
            {settings.payments.enabled.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </div>
      </Card>
    );
  };

  //   const AlertsSection = () => (
  //     <Card title="Alerts & Numbering" icon={Bell}>
  //       <div className="grid sm:grid-cols-3 gap-4">
  //         <Field type="number" label="Low Stock Threshold" value={settings.alerts.lowStockThreshold}
  //                onChange={(e) => setSettings(s => ({ ...s, alerts: { ...s.alerts, lowStockThreshold: Number(e.target.value) } }))}/>
  //         <Field label="Invoice Prefix" value={settings.alerts.invoicePrefix}
  //                onChange={(e) => setSettings(s => ({ ...s, alerts: { ...s.alerts, invoicePrefix: e.target.value.toUpperCase() } }))}/>
  //         <Field type="number" label="Start Number" value={settings.alerts.startNumber}
  //                onChange={(e) => setSettings(s => ({ ...s, alerts: { ...s.alerts, startNumber: Number(e.target.value) } }))}/>
  //       </div>
  //     </Card>
  //   );

  const SecuritySection = () => {
    const [form, setForm] = useState({
      email: "",
      old: "",
      next: "",
      confirm: "",
    });
    const [loading, setLoading] = useState(false);

    const changePassword = async () => {
      if (!form.email || !form.old || !form.next) {
        notify("All fields are required", "error");
        return;
      }
      if (form.next !== form.confirm) {
        notify("Passwords do not match", "error");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/updatepassword", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            oldPassword: form.old,
            newPassword: form.next,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");

        notify(data.message || "Password updated");
        setForm({ email: "", old: "", next: "", confirm: "" });
      } catch (err) {
        console.error("Change password error:", err);
        notify(err.message || "Failed to change password", "error");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Card title="Security" icon={Shield}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Field
            label="Current Password"
            type="password"
            value={form.old}
            onChange={(e) => setForm({ ...form, old: e.target.value })}
          />
          <Field
            label="New Password"
            type="password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
          <Field
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <Btn icon={KeyRound} onClick={changePassword} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Btn>
        </div>
      </Card>
    );
  };

  const DataSection = () => (
    <Card
      title="Backup & Data"
      icon={Database}
      actions={
        <>
          <Btn icon={Download} onClick={exportJSON}>
            Export JSON
          </Btn>
          <Btn icon={Upload} onClick={() => fileRef.current?.click()}>
            Import JSON
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onImport}
            className="hidden"
          />
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-200">
          Export your full settings to a JSON file. Import later to restore.
        </p>
        <div className="flex gap-2">
          <Btn
            icon={RefreshCw}
            className="border-red-400/40 hover:bg-red-500/20"
            onClick={resetDefaults}
          >
            Reset Defaults
          </Btn>
          <Btn
            icon={Save}
            className="bg-emerald-600/80 hover:bg-emerald-600 border-emerald-400/60"
            onClick={saveAll}
          >
            Save All
          </Btn>
        </div>
      </div>
    </Card>
  );

  const section = useMemo(() => {
    switch (tab) {
      case "store":
        return <StoreSection />;
      case "tax":
        return <TaxSection />;
      case "payments":
        return <PaymentsSection />;
      case "security":
        return <SecuritySection />;
      case "data":
        return <DataSection />;
      default:
        return null;
    }
  }, [tab, settings]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/80">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-400 via-gray-900 to-black">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 p-5 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Settings</h2>
              <div className="mt-1 text-sm text-gray-300 flex items-center gap-2">
                <Chip>POS</Chip>
                <Chip>{settings.theme.mode} theme</Chip>
                <Chip>{settings.theme.currency}</Chip>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn
                icon={Save}
                className="bg-indigo-600 hover:bg-indigo-700 border-indigo-400/50"
                onClick={saveAll}
              >
                Save All
              </Btn>
              <Btn icon={RefreshCw} onClick={resetDefaults}>
                Reset
              </Btn>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border text-sm transition
        ${
          tab === t.key
            ? "bg-indigo-600 text-white border-indigo-400/60"
            : "bg-white/10 border-white/15 hover:bg-white/20 text-gray-200"
        }`}
              >
                <t.icon size={18} />
                <span className="text-xs lg:text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Current Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {section}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            text={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
