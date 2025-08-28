const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  sku: {
    type: String,
    unique: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String
  },
  barcodeImage: {
    type: String // yahan base64 ya image ka URL store karoge
  }
}, { timestamps: true });

// Auto-generate SKU before saving
productSchema.pre("save", function(next) {
  if (!this.sku) {
    // SKU = CAT + timestamp
    const catCode = this.category ? this.category.toString().substring(0, 4).toUpperCase() : "PRD";
    this.sku = `${catCode}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
