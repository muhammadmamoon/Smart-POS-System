  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { jsPDF } from "jspdf";
  import autoTable from "jspdf-autotable";
  import { useSettings } from "../context/SettingsContext";
  export default function InvoiceForm() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState("");
    const [discount, setDiscount] = useState(0);
    const [amountReceived, setAmountReceived] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const { settings } = useSettings();

    // 🔹 Fetch products
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const res = await axios.get("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/products");
          if (Array.isArray(res.data)) {
            setProducts(res.data);
          } else if (Array.isArray(res.data.products)) {
            setProducts(res.data.products);
          } else {
            console.error("Unexpected product data:", res.data);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      fetchProducts();
    }, []);

    // 🔹 Filtered suggestions
    const filteredProducts = productName
      ? products.filter((p) =>
          (p?.productName || "")
            .toLowerCase()
            .startsWith(productName.toLowerCase())
        )
      : [];

    // 🔹 Add item
    const addItem = (product) => {
      if (!product.stock || product.stock <= 0) {
        alert(`${product.productName} is out of stock!`);
        return;
      }

      const existing = items.find((i) => i._id === product._id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          alert(
            `Only ${product.stock} units available for ${product.productName}`
          );
          return;
        }
        setItems(
          items.map((i) =>
            i._id === product._id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  total: (i.quantity + 1) * i.sellingPrice,
                }
              : i
          )
        );
      } else {
        setItems([
          ...items,
          { ...product, quantity: 1, total: product.sellingPrice },
        ]);
      }
      setProductName("");
    };

    // 🔹 Update qty
    const updateQuantity = (id, qty) => {
      setItems(
        items.map((i) => {
          if (i._id === id) {
            if (qty > i.stock) {
              alert(`Only ${i.stock} units available for ${i.productName}`);
              return { ...i, quantity: i.stock, total: i.stock * i.sellingPrice };
            }
            return { ...i, quantity: qty, total: qty * i.sellingPrice };
          }
          return i;
        })
      );
    };

    // 🔹 Remove item
    const removeItem = (id) => {
      setItems(items.filter((i) => i._id !== id));
    };

    // 🔹 Totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (settings.taxDiscount.taxPct / 100);
    const netTotal = subtotal - discount + tax;
    const changeReturned =
      amountReceived && amountReceived >= netTotal
        ? amountReceived - netTotal
        : 0;

    // 🔹 Save invoice & update stock
    const createInvoice = async () => {
      if (items.length === 0) {
        alert("Add at least one product!");
        return;
      }

      for (let item of items) {
        if (item.quantity > (item.stock || 0)) {
          alert(`Not enough stock for ${item.productName}`);
          return;
        }
      }

      if (amountReceived === "" || amountReceived < netTotal) {
        alert(`Amount Received must be at least Rs.${netTotal}`);
        return;
      }
      if (amountReceived < 0) {
        alert("Amount Received cannot be negative!");
        return;
      }

      try {
        const payload = {
          items: items.map((item) => ({
            product_id: item._id,
            name: item.productName,
            quantity: item.quantity,
            price: item.sellingPrice,
            total: item.total,
          })),
          subtotal,
          discount_total: discount,
          tax_total: tax,
          net_total: netTotal,
          payment_method: paymentMethod,
          amount_received: amountReceived,
          change_returned: changeReturned,
        };

        await axios.post("https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/invoice/create", payload);

        for (let item of items) {
          const newStock = (item.stock || 0) - item.quantity;
          await axios.put(`https://smart-pos-system-b3o3-mv3a533vo-muhammadmamoons-projects.vercel.app/api/products/${item._id}`, {
            stock: newStock < 0 ? 0 : newStock,
          });
        }

        alert("✅ Invoice Created & Stock Updated Successfully!");

        setItems([]);
        setProductName("");
        setDiscount(0);
        setAmountReceived("");
        setPaymentMethod("Cash");
      } catch (error) {
        console.error("Error saving invoice or updating stock:", error);
        alert("❌ Error while creating invoice");
      }
    };

    // 🔹 Download PDF
    const downloadPDF = () => {
      if (items.length === 0) {
        alert("No items to print!");
        return;
      }
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("My Shop", 14, 15);
      doc.setFontSize(10);
      doc.text("Address: Karachi, Pakistan | Contact: 0300-1234567", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [["#", "Product", "Price", "Qty", "Total"]],
        body: items.map((item, idx) => [
          idx + 1,
          item.productName,
          `Rs.${item.sellingPrice}`,
          item.quantity,
          `Rs.${item.total}`,
        ]),
        styles: { fontSize: 10 },
        theme: "grid",
      });

      let finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.text(`Subtotal: Rs.${subtotal}`, 14, finalY);
      doc.text(`Discount: Rs.${discount}`, 14, finalY + 7);
      doc.text(`Tax (5%): Rs.${tax}`, 14, finalY + 14);
      doc.text(`Total: Rs.${netTotal}`, 14, finalY + 21);
      doc.text(`Received: Rs.${amountReceived}`, 14, finalY + 28);
      doc.text(`Change: Rs.${changeReturned}`, 14, finalY + 35);

      doc.save(`invoice-${Date.now()}.pdf`);
    };

    // 🔹 Print invoice
    const printInvoice = () => {
      if (items.length === 0) {
        alert("No items to print!");
        return;
      }
      const invoiceContent = document.querySelector(".invoice-area").innerHTML;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              th { background-color: #f4f4f4; }
              .summary { margin-top: 20px; font-size: 14px; }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    };

    return (
      <div className="w-full  mx-auto p-6 shadow-2xl  bg-gradient-to-br from-gray-400 via-gray-900 to-black text-white">
        <h2 className="text-2xl font-bold text-center text-white">
          🧾 {settings.store?.name} - Invoice System
        </h2>
        <p className="text-center text-gray-400 mb-4">
          {/* Address: Karachi, Pakistan | Contact: 0300-1234567 */}
          {settings.store?.address} | Contact: {settings.store?.phone}
        </p>

        {/* 🔹 Invoice Area */}
        <div className="invoice-area">
          {/* Product Search */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="🔍 Search Product"
              className="border p-3 w-full rounded-md shadow-sm bg-white/10 text-white placeholder-gray-400"
            />
            {filteredProducts.length > 0 && (
              <ul className="absolute z-10 border bg-gray-800 text-white mt-1 max-h-40 overflow-y-auto w-full rounded shadow-lg">
                {filteredProducts.map((p) => (
                  <li
                    key={p._id}
                    className={`p-2 cursor-pointer hover:bg-gray-700 transition ${
                      p.stock < 5 ? "text-red-400 font-semibold" : "text-gray-200"
                    }`}
                    onClick={() => addItem(p)}
                  >
                    {p.productName} - Rs.{p.sellingPrice} (Stock: {p.stock})
                    {p.stock < 5 && (
                      <span className="ml-2 text-xs text-red-500">
                        ⚠ Low Stock
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Invoice Table */}
          <table className="w-full mt-6 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-white/10 text-gray-200">
                <th className="p-2 border border-gray-700">#</th>
                <th className="p-2 border border-gray-700">Product</th>
                <th className="p-2 border border-gray-700">Price</th>
                <th className="p-2 border border-gray-700">Qty</th>
                <th className="p-2 border border-gray-700">Total</th>
                <th className="p-2 border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className={`${
                    item.stock < 5
                      ? "bg-red-900/40 text-red-300"
                      : "bg-gray-900/40"
                  }`}
                >
                  <td className="p-2 border border-gray-700">{i + 1}</td>
                  <td className="p-2 border border-gray-700">
                    {item.productName}
                  </td>
                  <td className="p-2 border border-gray-700">
                    Rs.{item.sellingPrice}
                  </td>
                  <td className="p-2 border border-gray-700">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item._id, Number(e.target.value))
                      }
                      className="border p-1 w-16 rounded bg-black/50 text-white"
                    />
                  </td>
                  <td className="p-2 border border-gray-700">Rs.{item.total}</td>
                  <td className="p-2 border border-gray-700 text-center">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                    >
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="bg-black/30 shadow-lg rounded-xl p-5 w-96 border border-gray-500">
              <h2 className="text-lg font-semibold text-gray-100 border-b border-gray-600 pb-2 mb-3">
                Invoice Summary
              </h2>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">Rs.{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax {settings.taxDiscount.taxPct}:</span>
                  <span className="font-medium">Rs.{tax}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Discount:</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(Math.max(0, Number(e.target.value)))
                    }
                    className="border rounded-md px-2 py-1 w-20 text-right bg-black/50 text-white"
                  />
                </div>

                <div className="flex justify-between text-base font-semibold text-white border-t border-gray-600 pt-2">
                  <span>Total:</span>
                  <span>Rs.{netTotal}</span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mt-4 space-y-2 text-sm">
                <label className="block text-gray-300 font-medium">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="border rounded-md px-3 py-2 w-full bg-black/50 text-white"
                >
                  {settings.payments.enabled.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>

                <label className="block text-gray-300 font-medium mt-3">
                  Amount Received
                </label>
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={amountReceived}
                  min={netTotal}
                  onChange={(e) =>
                    setAmountReceived(Math.max(netTotal, Number(e.target.value)))
                  }
                  className="border rounded-md px-3 py-2 w-full bg-black/50 text-white"
                />

                <div className="flex justify-between font-medium text-gray-200 mt-2">
                  <span>Change Returned:</span>
                  <span>Rs.{changeReturned}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={createInvoice}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
          >
            ✅ Create Invoice
          </button>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
          >
            📥 Download PDF
          </button>
          <button
            onClick={printInvoice}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow"
          >
            🖨 Print
          </button>
        </div>
      </div>
    );
  }
