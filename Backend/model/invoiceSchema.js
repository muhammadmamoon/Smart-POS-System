const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    unique: true,
  },
  date_time: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
      },
    },
  ],
  subtotal: {
    type: Number,
    default: 0,
  },
  discount_total: {
    type: Number,
    default: 0,
  },
  tax_total: {
    type: Number,
    default: 0,
  },
  net_total: {
    type: Number,
    default: 0,
  },
  payment_method: {
    type: String,
    enum: ["Cash", "Card", "EasyPaisa", "JazzCash"],
    required: true,
  },
  amount_received: {
    type: Number,
    required: true,
  },
  change_returned: {
    type: Number,
    default: 0,
  },
});

// Pre-save hook
invoiceSchema.pre("save", function (next) {
  // Generate invoice number if not present
  if (!this.invoice_number) {
    this.invoice_number = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Auto-calc item totals
  this.items.forEach(item => {
    item.total = item.price * item.quantity;
  });

  // Auto-calc subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Auto-calc net total
  this.net_total = this.subtotal - this.discount_total + this.tax_total;

  // Auto-calc change
  this.change_returned = this.amount_received - this.net_total;

  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
  