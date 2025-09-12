// routes/pendingLeadRoutes.js
const express = require("express");
const router = express.Router();
const PendingPaymentLead = require("../models/PendingPaymentLead");
const Invoice = require("../models/Invoice");
const Lead = require("../models/LeadUpload");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const { ACCOUNT_ID } = require("../constants/profiles");

// 1) Add Pending Lead manually (for testing / Postman)
router.post("/pending-leads/add", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { name, mobile, email, leadId, lastService } = req.body;
    const newLead = new PendingPaymentLead({
      leadId: leadId || null,
      name,
      mobile,
      email,
      lastService: lastService || "Service"
    });
    await newLead.save();
    // notify sockets (optional)
    global.io && global.io.emit('pendingCountsUpdated');
    res.json({ success: true, message: "Pending lead added", lead: newLead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add pending lead" });
  }
});

// 2) GET list
router.get("/pending-leads", authenticateUser, async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    const profileId = req.user?.profileId?.toString();

    if (role !== "admin" && profileId !== ACCOUNT_ID) {
      return res.status(403).json({ message: "Forbidden: Only Admin or Accounts can access" });
    }

    const leads = await PendingPaymentLead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending leads" });
  }
});

// 3) GET single pending lead
router.get("/pending-leads/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const pending = await PendingPaymentLead.findById(req.params.id);
    if (!pending) return res.status(404).json({ error: "Pending lead not found" });
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending lead" });
  }
});

// 4) Add payment for pending lead => creates Invoice, removes pending entry
router.post("/pending-leads/:id/add-payment", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { id } = req.params; // pending id
    const {
      product, pack, price = 0, discount = 0, paid = 0, gst = 0, transactionCharge = 0, duration = "30 Days"
    } = req.body;

    const pendingLead = await PendingPaymentLead.findById(id);
    if (!pendingLead) return res.status(404).json({ error: "Pending lead not found" });

    const newInvoice = new Invoice({
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date(),
      clientName: pendingLead.name,
      mobile: pendingLead.mobile,
      email: pendingLead.email,
      leadId: pendingLead.leadId || null,
      product,
      pack,
      price,
      discount,
      paid,
      gst,
      transactionCharge,
      duration,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: "Running",
      createdBy: req.user._id
    });

    await newInvoice.save();

    // Remove pending entry
    await PendingPaymentLead.findByIdAndDelete(id);

    // Emit sockets so sidebar updates
    global.io && global.io.emit('pendingCountsUpdated');
    global.io && global.io.emit('newInvoice', newInvoice);

    res.json({ success: true, message: "Payment added, invoice started", invoice: newInvoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add payment" });
  }
});



module.exports = router;
