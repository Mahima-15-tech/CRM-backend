const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/PaymentController");
const { authenticateUser } = require("../middleware/authMiddleware");

// POST - Add Payment
router.post("/add",authenticateUser, paymentController.addPayment);

// GET - Payments for a lead
router.get("/by-lead/:leadId",authenticateUser, paymentController.getPaymentsByLead);

// Admin - get all pending payments
router.get("/admin/pending", authenticateUser, paymentController.getPendingPayments);

// Admin - bulk approve/deny payments
router.post("/admin/bulk-update", authenticateUser, paymentController.bulkUpdatePaymentStatus);

router.get("/admin/all", authenticateUser, paymentController.getAllApprovedPayments);

router.get("/sales-report", authenticateUser, paymentController.getSalesReport);



module.exports = router;
