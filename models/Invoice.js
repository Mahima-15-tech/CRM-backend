const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  invoiceDate: Date,
  clientName: String,
  mobile: String,
  email: String,
  pan: String,
  dob: String,
  city: String,
  product: String,
  pack: String,
  price: Number,
  discount: Number,
  paid: Number,
  gst: Number,
  transactionCharge: Number,
  startDate: Date,
  endDate: Date,
  duration: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  leadSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadSource", // ✅ newly added
  },
  leadResponse: String, // ✅ newly added
  status: { type: String, default: "Pending" },
  prStatus: { type: String, default: "Pending" },
  riskStatus: { type: String, default: "Pending" },
  kycStatus: { type: String, default: "Pending" },

   paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },

  leadId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Lead",
  required: true,
},

}, {
  timestamps: true
});

module.exports = mongoose.model("Invoice", invoiceSchema);
