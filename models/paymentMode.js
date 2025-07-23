const mongoose = require("mongoose");

const paymentModeSchema = new mongoose.Schema({
  name: String,
  charges: Number,
  gstin: String,
  state: String,
  invoicePrefix: String
}, { timestamps: true });

module.exports = mongoose.model("PaymentMode", paymentModeSchema);
