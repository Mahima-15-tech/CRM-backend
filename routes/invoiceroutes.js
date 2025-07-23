// routes/invoiceroutes.js
const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const Invoice = require('../models/Invoice'); // your Mongoose model
const { authenticateUser } = require("../middleware/authMiddleware");
// const {generateInvoicePDF} = require('../utils/generateInvoicePdf');



// Create
router.post("/add", invoiceController.addInvoice);

// Get pending for approval
router.get("/pending", invoiceController.getPendingInvoices);

// Get all invoices
router.get("/all",authenticateUser, invoiceController.getAllInvoices);



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

// router.get('/invoice-pdf/:id', async (req, res) => {
//     try {
//       const invoice = await Invoice.findById(req.params.id).lean();
//       if (!invoice) return res.status(404).send('Invoice not found');
  
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', `inline; filename=Invoice_${invoice.invoiceNumber}.pdf`);
  
//       generateInvoicePDF(invoice, res); // pipe directly to response
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error generating PDF');
//     }
//   });

module.exports = router;
