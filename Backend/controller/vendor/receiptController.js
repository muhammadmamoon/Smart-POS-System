const Receipt = require('../../model/vendor/Receipt');
const Counter = require('../../model/vendor/Counter');
// Generate auto vendor code
async function getNextVendorCode() {
  const counter = await Counter.findOneAndUpdate(
    { name: "vendorCode" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const num = counter.value.toString().padStart(5, "0");
  return `VEND-${num}`;
}

// Create receipt
 const createReceipt = async (req, res) => {
  try {
    const { vendor, items, totals } = req.body;

    // Generate vendorCode
    const vendorCode = await getNextVendorCode();

    const receipt = new Receipt({
      vendorCode,
      vendorName: vendor.name,
      contact: vendor.contact,
      address: vendor.address,
      items,
      totals
    });

    await receipt.save();
    res.status(201).json({
      message: "Receipt created successfully",
      vendorCode,
      receipt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all receipts
const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReceipt, getReceipts };