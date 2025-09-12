// models/WebLead.js
const mongoose = require("mongoose");

const webLeadSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String, default: "user" },
  status: { type: String, enum: ["lead", "ft", "client"], default: "lead" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WebLead", webLeadSchema);
