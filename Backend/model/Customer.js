// models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
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
  // Used to track outstanding credit the shop owes or the customer owes
  creditBalance: {
    type: Number,
    default: 0 // positive = customer owes shop, negative = shop owes customer (refund/overpayment)
  },
  // optional: array of sale/invoice ids
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale" // or "Invoice" depending on your sales model name
    }
  ],
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// helper static / instance methods (example)
customerSchema.methods.adjustCredit = function(amount) {
  // amount positive increases customer's debt, negative reduces
  this.creditBalance = Number((this.creditBalance + amount).toFixed(2));
  return this.save();
};

module.exports = mongoose.model("Customer", customerSchema);
