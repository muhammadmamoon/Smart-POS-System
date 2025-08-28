const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateReport = (reportTitle, data, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fullPath = path.join(outputPath, `${reportTitle}.pdf`);
      const stream = fs.createWriteStream(fullPath);

      doc.pipe(stream);

      // Title
      doc.fontSize(20).text(reportTitle, { align: "center" });
      doc.moveDown();

      // Table header
      doc.fontSize(12);
      Object.keys(data[0] || {}).forEach((key) => {
        doc.text(`${key}`, { continued: true, width: 100 });
      });
      doc.moveDown();

      // Table rows
      data.forEach((row) => {
        Object.values(row).forEach((val) => {
          doc.text(`${val}`, { continued: true, width: 100 });
        });
        doc.moveDown();
      });

      doc.end();

      stream.on("finish", () => resolve(fullPath));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateReport;
