const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  fatherName: String,
  state: String,
  district: String,
  city: String,
  address: String,
  pan: String,
  gst: String,
  dob: String,  // you can use Date type too
  aadhaar: String,
  alternateMobile: String,
  occupation: String,

  // Investment Info
  segment: String,
  investment: String,
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    default: null,
  },
  
  experience: String,

  // Lead Logic
  leadType: {
    type: String,
    enum: ["Premium", "HNI", "Web", "Fresh", "SEO"],
    default: "Fresh",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeData",
    default: null,
  },

  createdAt: {
  type: Date,
  default: Date.now,
},

  leadSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadSource",
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeData",
  },
  response: { type: String, default: "" },
  comment: { type: String, default: "" },
  isOld: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  responseModifiedAt: { type: Date },


  leadStatus: {
    type: String,
    enum: ["New", "Old", "Disposed", "Deleted", "DND"],
    default: "New",
  },

  colorStatus: {
  type: String,
  enum: ["Green", "Yellow", "Red", "White"],
  default: "Green",
},


  assignedDate: {
  type: Date,
},



}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
