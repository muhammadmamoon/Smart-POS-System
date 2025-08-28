const express = require("express");
const router = express.Router();
const invoiceController = require("../controller/Invoice");

// Create invoice
router.post("/create", invoiceController.createInvoice);

// Get all invoices
router.get("/", invoiceController.getAllInvoices);

// Get invoice by ID
router.get("/:id", invoiceController.getInvoiceById);

module.exports = router;
