const mongoose = require("mongoose");

const paymentEntrySchema = new mongoose.Schema({
  product: String,
  pack: String,
  serviceRate: Number,
  tax: Number,
  discount: Number,
  adjustment: Number,
  paid: Number,
  fromDate: Date,
  toDate: Date,
});

const paymentSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  raisedByName: String,
  paymentMode: String,
  transactionId: String,
  description: String,
  date: Date,
  entries: [paymentEntrySchema],

  amountReceived: Number,
  serviceCharge: Number,
  igst: Number,
  totalPaid: Number,
  status: {
  type: String,
  enum: ["Pending", "Approved", "Denied"],
  default: "Pending"
},

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
