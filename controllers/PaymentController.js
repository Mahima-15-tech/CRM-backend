const mongoose = require("mongoose"); // <-- REQUIRED for ObjectId conversion

const Payment = require("../models/Payment");
const KYC = require("../models/KYC");
const Lead = require("../models/LeadUpload");

const Invoice = require("../models/Invoice");
const WebLead = require("../models/weblead");
const { ACCOUNT_ID } = require("../../crm-frontend/src/constants/profiles");



exports.addPayment = async (req, res) => {
  try {
    const { leadId, leadType = "Lead", paymentMode, date, transactionId, description, entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ success: false, message: "Entries must be an array" });
    }

    // Determine model to fetch lead details
    const LeadModel = leadType === "WebLead" ? WebLead : Lead;

    // verify lead exists
    const lead = await LeadModel.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: `${leadType} not found` });
    }

    const userId = new mongoose.Types.ObjectId(req.user?._id || req.tokenData?.id);
    const username = req.user?.username || "Unknown";

    // create payment (save leadModel also)
    const payment = new Payment({
      leadId,
      leadModel: leadType,              // IMPORTANT
      paymentMode,
      transactionId,
      description,
      date,
      entries,
      raisedBy: userId,
      raisedByName: username,
      amountReceived: entries.reduce((sum, e) => sum + (Number(e.paid) || 0), 0),
      serviceCharge: entries.reduce((sum, e) => sum + ((e.serviceRate || 0) - (e.discount || 0)), 0),
      igst: entries.reduce((sum, e) => sum + (Number(e.tax) || 0), 0),
      totalPaid: entries.reduce((sum, e) => sum + (Number(e.paid) || 0), 0),
      status: "Pending",
    });

    const savedPayment = await payment.save();

    // Create Invoice immediately (store leadModel so later lookups work)
    const e = entries[0];
    const invoice = new Invoice({
      invoiceNumber: "INV" + Date.now(),
      invoiceDate: new Date(),
      clientName: lead.name || "Unknown",
      mobile: lead.mobile || lead.phone || "", 
      product: e.product,
      pack: e.pack,
      price: e.serviceRate,
      discount: e.discount,
      paid: e.paid,
      gst: e.tax,
      transactionCharge: e.adjustment || 0,
      startDate: e.fromDate,
      endDate: e.toDate,
      duration: (e.totalDays ? e.totalDays + " Days" : ""),
      leadId,
      leadModel: leadType,           // add this field to invoice schema too (see below)
      paymentId: savedPayment._id,
      prStatus: "Pending",
      riskStatus: "Pending",
      kycStatus: "Pending",
      status: "Pending",
      createdBy: userId
    });

    await invoice.save();

    // Emit events (if you use socket.io)
    if (global && global.io) {
      global.io.emit('newInvoice', invoice);
      global.io.emit('pendingCountsUpdated');
    }

    // Create KYC entry if not exists (for this leadId + leadModel)
    let kyc = await KYC.findOne({ leadId, leadModel: leadType });
    if (!kyc) {
      kyc = new KYC({
        leadId,
        leadModel: leadType,
        raisedBy: userId,
        pancard: lead.pan || "",
        dob: lead.dob || null,
        status: "Pending"
      });
      await kyc.save();
    }

    // Optionally create a pending KYC for invoice if you need to track differently

    res.status(201).json({ success: true, data: savedPayment });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPaymentsByLead = async (req, res) => {
  try {
    console.log("➡️ GET /api/payments/by-lead/:leadId", req.params.leadId);

    const payments = await Payment.find({ leadId: req.params.leadId }).sort({ createdAt: -1 });
    console.log("✅ Found Payments:", payments.length);

    res.json(payments);
  } catch (error) {
    console.error("❌ Fetch payments error:", error);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};


// ✅ Get all pending payments for admin approval
exports.getPendingPayments = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const userProfileId = req.user?.profileId?.toString();
    const userId = req.user?._id;

    let filter = { status: "Pending" };

    // ✅ Admin + Accounts → full access
    if (userRole !== "admin" && userProfileId !== ACCOUNT_ID) {
      filter.raisedBy = userId; // normal user → sirf apna data
    }

    const pendingPayments = await Payment.find(filter)
      .populate("leadId", "name mobile pan dob") 
      .populate("raisedBy", "username"); 

    res.json(pendingPayments);
  } catch (err) {
    console.error("Error fetching pending payments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Bulk approve or deny payments
exports.bulkUpdatePaymentStatus = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const userProfileId = req.user?.profileId?.toString();

    // ✅ Only Admin or Accounts can approve/deny
    if (userRole !== "admin" && userProfileId !== ACCOUNT_ID) {
      return res.status(403).json({ success: false, message: "Forbidden: Only Admin or Accounts can approve/deny payments" });
    }

    const { ids, status } = req.body;

    const payments = await Payment.find({ _id: { $in: ids } });

    for (const payment of payments) {
      payment.status = status;
      await payment.save();

      if (status === "Approved") {
        let invoice = await Invoice.findOne({ paymentId: payment._id });
        if (!invoice) {
          invoice = await Invoice.findOne({ leadId: payment.leadId });
        }

        if (invoice) {
          invoice.prStatus = "Complete";
          if (invoice.kycStatus === "Complete") {
            invoice.status = "Running";
          }
          await invoice.save();
        }
      }
    }

    res.json({ success: true, message: `Updated ${payments.length} payments` });
  } catch (err) {
    console.error("Bulk payment update error:", err);
    res.status(500).json({ success: false, message: "Error updating payments" });
  }
};



// ✅ Get all approved payments (admin)
exports.getAllApprovedPayments = async (req, res) => {
  try {
    console.log("🔎 Debug check => user.profileId:", req.user?.profileId, " | ACCOUNT_ID:", ACCOUNT_ID);

    const filters = { status: "Approved" };

    if (req.user?.role?.toLowerCase() === "admin") {
      // Admin → sab payments
      if (req.query.raisedBy) filters.raisedBy = req.query.raisedBy;
    } 
    else if (req.user?.profileId?.toString() === ACCOUNT_ID) {
      // Accounts profile → admin jaisa full access
      if (req.query.raisedBy) filters.raisedBy = req.query.raisedBy;
    }
    else {
      // Normal employee → sirf apne payments
      filters.raisedBy = req.user._id;
    }

    if (req.query.leadSource) filters.leadSource = req.query.leadSource;
    if (req.query.fromDate && req.query.toDate) {
      filters.date = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate)
      };
    }

    const payments = await Payment.find(filters)
      .populate("leadId", "name mobile pan dob leadSource")
      .populate("raisedBy", "username");

    res.json(payments);
  } catch (err) {
    console.error("All payments fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET /api/dashboard/pending-pr
exports.getPendingPRCount = async (req, res) => {
  try {
    const count = await Payment.countDocuments({ status: "Pending" });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching pending PR" });
  }
};


// GET /api/payments/sales-report
// GET /api/payments/sales-report?employeeId=xxx&fromDate=2025-07-01&toDate=2025-07-31
exports.getSalesReport = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate } = req.query;

    if (!employeeId || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: "Missing query parameters" });
    }

    const payments = await Payment.aggregate([
      {
        $match: {
          raisedBy: new mongoose.Types.ObjectId(employeeId),
          status: "Approved",
          date: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$totalPaid" }
        }
      }
    ]);

    const totalPaid = payments[0]?.totalPaid || 0;

    res.json({ success: true, totalPaid });
  } catch (err) {
    console.error("💥 Sales Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
