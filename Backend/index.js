const express = require("express");
const serverless = require("serverless-http");   // npm install serverless-http
const connectDB = require("./config/db.js");
const auth = require("./routes/UserRoutes.js");
const category = require("./routes/categoryRoutes.js");
const product = require("./routes/productRoute.js");
const Supplier = require("./routes/supplierRoutes.js");
const Customer = require("./routes/customerRoutes.js");
const invoice = require("./routes/invoiceRoutes.js");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL, // frontend ka live link
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// API routes
app.use("/api", auth);
app.use("/api/categories", category);
app.use("/api/products", product);
app.use("/api/suppliers", Supplier);
app.use("/api/purchases", Customer);
app.use("/api/invoice", invoice);

// Connect DB
connectDB();

// ✅ Serverless export
module.exports = app;
module.exports.handler = serverless(app);
