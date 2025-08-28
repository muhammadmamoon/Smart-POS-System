const express = require("express");
const router = express.Router();
const supplierCtrl = require("../controller/supplierController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, supplierCtrl.createSupplier);
router.get("/",  supplierCtrl.getSuppliers);
router.get("/:id", supplierCtrl.getSupplierById);
router.put("/:id", authenticateToken, supplierCtrl.updateSupplier);
router.delete("/:id", authenticateToken, supplierCtrl.deleteSupplier);
router.post("/:id/outstandin", authenticateToken,supplierCtrl.adjustOutstanding);

module.exports = router;
