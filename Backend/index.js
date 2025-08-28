const express = require("express");
const app = express();
const port = 3000;
const connectDB = require("./config/db.js");
const auth = require("./routes/UserRoutes.js");
const category = require("./routes/categoryRoutes.js");
const product = require("./routes/productRoute.js");
const Supplier = require("./routes/supplierRoutes.js");
const Customer = require("./routes/customerRoutes.js");
const invoice = require("./routes/invoiceRoutes.js");
// const userRoutes = require("./rolebaseuser/userRoutes.js");


const cors = require("cors");

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://smart-pos-system-iota.vercel.app", // React frontend ka URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.use('/auth', productModel);
app.use("/api", auth);
// app.use("/api/createusers", userRoutes);

// Routes
app.use("/api/categories", category);
app.use("/api/products", product);
app.use("/api/suppliers", Supplier);
app.use("/api/purchases", Customer);
app.use("/api/invoice", invoice);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});

export default app;