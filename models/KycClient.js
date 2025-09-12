const mongoose = require("mongoose");

const kycClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  mobile: { type: String, required: true },

 

  // file URLs after Cloudinary upload
  aadhaarFront: { type: String, default: null },
  aadhaarBack: { type: String, default: null },
//   photo: { type: String, default: null },
  pan: { type: String, default: null },

  status: { type: String, enum: ["Pending", "Complete"], default: "Pending" },
//   raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("KycClient", kycClientSchema);
