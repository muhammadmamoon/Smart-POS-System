const { generateSalesReport } = require("../utils/reportGenerator");

exports.downloadSalesReport = async (req, res) => {
  const salesData = await Sale.find({ date: { $gte: req.query.start, $lte: req.query.end } });

  const reportBuffer = await generateSalesReport(salesData); // ✅ Here

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
  res.send(reportBuffer);
};
