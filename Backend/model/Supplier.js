// models/Supplier.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    default: ""
  },
  // products supplied (optional relation)
  productsSupplied: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  // outstanding balance owed to supplier (for purchases on credit)
  outstandingBalance: {
    type: Number,
    default: 0
  },
  // array of purchase ids (Purchase model / PurchaseOrder etc.)
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase" // create Purchase model to store purchase invoices
    }
  ],
  paymentTerms: {
    type: String,
    default: "Cash" // e.g., "Net 30", "Net 15", "Cash"
  },
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// helper: adjust outstanding balance
supplierSchema.methods.adjustOutstanding = function(amount) {
  // amount positive increases outstanding (you owe more), negative reduces (payment)
  this.outstandingBalance = Number((this.outstandingBalance + amount).toFixed(2));
  return this.save();
};

module.exports = mongoose.model("Supplier", supplierSchema);
