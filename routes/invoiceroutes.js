// routes/invoiceroutes.js
const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const Invoice = require('../models/Invoice'); // your Mongoose model
const { authenticateUser } = require("../middleware/authMiddleware");
// const {generateInvoicePDF} = require('../utils/generateInvoicePdf');



// Create
router.post("/add", invoiceController.addInvoice);
router.post("/convert", authenticateUser, invoiceController.convertToClient);

// Get pending for approval
router.get("/pending", invoiceController.getPendingInvoices);

// Get all invoices
router.get("/all",authenticateUser, invoiceController.getAllInvoices);

router.get("/mysubscription", authenticateUser, invoiceController.checkSubscription);

// Update invoice (edit from modal)
router.patch("/update/:id", invoiceController.updateInvoiceStatus);

// Approve / Deny
router.patch("/status/:id", invoiceController.approveOrDenyInvoice);
router.get("/client-count", authenticateUser, invoiceController.getClientCount);

router.get('/invoice-pdf/:id', invoiceController.generateInvoicePDF);

router.get("/", authenticateUser, invoiceController.getInvoicesByStatus);

// Full invoice update (edit modal se)
router.put("/edit/:id", invoiceController.updateInvoice);


// Get invoice by ID (for preview)
router.get("/:id", invoiceController.getInvoiceById);





module.exports = router;
