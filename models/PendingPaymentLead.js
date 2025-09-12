// models/PendingPaymentLead.js
const mongoose = require("mongoose");

const pendingPaymentLeadSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  name: String,
  mobile: String,
  email: String,
  lastInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  lastService: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingPaymentLead", pendingPaymentLeadSchema);
