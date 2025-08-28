// src/context/SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const SETTINGS_KEY = "pos_settings_v1";

const DEFAULTS = {
  store: { name: "Smart POS", phone: "0300-0000000", address: "Karachi, Pakistan", logo: "" },
  theme: { mode: "dark", accent: "indigo", currency: "PKR", dateFormat: "DD/MM/YYYY" },
  taxDiscount: { taxPct: 5, allowGlobalDiscount: true, maxDiscountPct: 50 },
  receipt: { showLogo: true, headerNote: "Thank you!", footerNote: "No returns without receipt." },
  payments: { enabled: ["Cash", "Card"], defaultMethod: "Cash" },
  alerts: { lowStockThreshold: 5, invoicePrefix: "INV", startNumber: 1001 },
  printer: { width: 80, autoPrintOnInvoice: false },
  security: { requirePinToRefund: true },
  integrations: { easypaisaKey: "", jazzcashKey: "" },
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
