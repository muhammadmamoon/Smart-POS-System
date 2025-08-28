const Invoice = require("../model/invoiceSchema");

// Auto generate invoice number function
async function generateInvoiceNumber() {
  const lastInvoice = await Invoice.findOne().sort({ invoice_number: -1 });
  if (!lastInvoice) {
    return "INV-1001";
  }
  const lastNumber = parseInt(lastInvoice.invoice_number.split("-")[1]);
  return `INV-${lastNumber + 1}`;
}


// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      discount_total,
      tax_total,
      net_total,
      payment_method,
      amount_received,
      change_returned,
    } = req.body;

    // Generate auto invoice number
    const invoice_number = await generateInvoiceNumber();

    const newInvoice = new Invoice({
      invoice_number,
      items,
      subtotal,
      discount_total,
      tax_total,
      net_total,
      payment_method,
      amount_received,
      change_returned,
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Single Invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
