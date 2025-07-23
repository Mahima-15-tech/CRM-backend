const mongoose = require("mongoose");

const todayFollowUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeData" },   // owner
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeData" }, // optional: jisko assign kiya
  name: String,
  mobile: String,
  leadSource: Object,
  date: Date,
  time: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
}, { timestamps: true });

module.exports = mongoose.model("TodaysFollowUp", todayFollowUpSchema);
