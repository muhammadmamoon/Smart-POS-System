const asyncHandler = require('express-async-handler');
const Vendor = require('../../model/vendor/Vendor');
const { getNextSeq } = require('./utils');

// POST /api/vendors
exports.createVendor = asyncHandler(async (req, res) => {
  const { name, contactNumber, address } = req.body;
  if (!name) { res.status(400); throw new Error('Vendor name required'); }

  const seq = await getNextSeq('vendor');
  const vendorCode = `VEND-${String(seq).padStart(5,'0')}`;

  const vendor = await Vendor.create({ vendorCode, name, contactNumber, address });
  res.status(201).json(vendor);
});

// GET /api/vendors (optional quick list)
exports.listVendors = asyncHandler(async (_req, res) => {
  const v = await Vendor.find().sort({ createdAt: -1 }).limit(100);
  res.json(v);
});
