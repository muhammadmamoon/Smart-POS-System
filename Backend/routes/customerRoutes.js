const { Router } = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  adjustCredit,
} = require("../controller/customerController");
const authenticateToken = require("../middleware/authMiddleware"); // optional
const router = Router();

router.post("/", authenticateToken, createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", authenticateToken, updateCustomer);
router.delete("/:id", authenticateToken, deleteCustomer);
router.post("/:id/credit", authenticateToken, adjustCredit);

module.exports = router;
