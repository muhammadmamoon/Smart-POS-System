const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Same category name repeat na ho
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null // null ka matlab yeh main category hai
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
