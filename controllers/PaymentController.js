const mongoose = require("mongoose"); // <-- REQUIRED for ObjectId conversion

const Payment = require("../models/Payment");
const KYC = require("../models/KYC");
const Lead = require("../models/LeadUpload");

const Invoice = require("../models/Invoice");

exports.addPayment = async (req, res) => {
  try {
    const { leadId, paymentMode, date, transactionId, description, entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ success: false, message: "Entries must be an array" });
    }

   const userId = new mongoose.Types.ObjectId(req.user?._id || req.tokenData.id);


    const username = req.user?.username || "Unknown";

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Create Payment
    const payment = new Payment({
      leadId,
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
      status: "Pending", // ✅ THIS IS MISSING

    });

const savedPayment = await payment.save();

    // Create Invoice Immediately
   const e = entries[0];
const invoice = new Invoice({
  invoiceNumber: "INV" + Date.now(),
  invoiceDate: new Date(),
  clientName: lead.name || "Unknown",
  mobile: lead.mobile || "", // ✅ Required if you want fallback mobile-based lookup
  product: e.product,
  pack: e.pack,
  price: e.serviceRate,
  discount: e.discount,
  paid: e.paid,
  gst: e.tax,
  transactionCharge: e.adjustment || 0,
  startDate: e.fromDate,
  endDate: e.toDate,
  duration: e.totalDays + " Days",
  leadId,
  paymentId: savedPayment._id, // ✅ THIS IS CRITICAL!
  prStatus: "Pending",
  riskStatus: "Pending",
  kycStatus: "Pending",
  status: "Pending",
  createdBy: userId
});

await invoice.save();


    // Create Pending KYC
    const existingKYC = await KYC.findOne({ leadId });
    if (!existingKYC) {
      await KYC.create({
        leadId,
        raisedBy: userId,
        pancard: lead.pan || "",
        dob: lead.dob || "",
        status: "Pending",
      });
    }

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
    let filter = { status: "Pending" };

if (req.user?.role?.toLowerCase() !== "admin") {
  filter.raisedBy = req.user._id;
}


const pendingPayments = await Payment.find(filter)

      .populate("leadId", "name mobile pan dob") // Get lead info
      .populate("raisedBy", "username"); // Get employee name

    res.json(pendingPayments);
  } catch (err) {
    console.error("Error fetching pending payments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Bulk approve or deny payments
exports.bulkUpdatePaymentStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    const payments = await Payment.find({ _id: { $in: ids } });

    for (const payment of payments) {
      payment.status = status;
      await payment.save();

      // ✅ Update related invoice using paymentId instead of mobile
      if (status === "Approved") {
        // Step 1: Try to find invoice by paymentId (correct logic)
let invoice = await Invoice.findOne({ paymentId: payment._id });

// Step 2: If not found, fallback to leadId match
if (!invoice) {
  invoice = await Invoice.findOne({ leadId: payment.leadId });
  console.warn(`⚠️ No invoice found by paymentId ${payment._id}, using leadId fallback`);
}

if (invoice) {
  invoice.prStatus = "Complete";

  if (invoice.kycStatus === "Complete") {
    invoice.status = "Running";
  }

  await invoice.save();
} else {
  console.warn(`⚠️ STILL no invoice found for payment ${payment._id}`);
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
    const filters = { status: "Approved" };
if (req.user?.role?.toLowerCase() === "admin") {
  if (req.query.raisedBy) filters.raisedBy = req.query.raisedBy;
} else {
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
