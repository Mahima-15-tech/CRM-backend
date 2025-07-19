// models/KYC.js
const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pancard: String,
  dob: Date,
  status: {
    type: String,
    enum: ["Pending", "Complete"],
    default: "Pending"
  },
  fileUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("KYC", kycSchema);
