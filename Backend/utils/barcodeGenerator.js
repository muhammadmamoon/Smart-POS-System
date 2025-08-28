const bwipjs = require("bwip-js");

// Generate a barcode image as Base64 PNG
const generateBarcode = async (text) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",       // Barcode type
      text,                  // Text to encode
      scale: 3,               // 3x scaling factor
      height: 10,             // Bar height, in mm
      includetext: true,      // Show text below barcode
      textxalign: "center",   // Center-align the text
    });

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    throw new Error("Failed to generate barcode: " + err.message);
  }
};

module.exports = generateBarcode;
