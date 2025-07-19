// controllers/kycController.js
const KYC = require("../models/KYC");
const Lead = require("../models/LeadUpload");
const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");

exports.createKYCEntry = async (req, res) => {
  try {
    const { leadId, raisedBy } = req.body;
    const lead = await Lead.findById(leadId);

    const newEntry = new KYC({
      leadId,
      raisedBy,
      pancard: lead.pan,
      dob: lead.dob,
    });

    await newEntry.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("KYC creation error:", err);
    res.status(500).json({ success: false });
  }
};

exports.getKYCByStatus = async (req, res) => {
  try {
    console.log("🔥 HIT /kyc/:status", req.params.status); 
    const { status } = req.params;

    let query = { status };

    // ✅ Convert role to lowercase for reliable comparison
    const role = (req.user?.role || "").toLowerCase();

    if (role !== "admin") {
      query.raisedBy = req.user?._id || req.tokenData?.id;
    }

    const records = await KYC.find(query)
      .populate("leadId", "name mobile customId pan dob")
      .populate("raisedBy", "username");

    res.json(records);
  } catch (err) {
    console.error("KYC fetch error:", err);
    res.status(500).json({ success: false });
  }
};



exports.uploadKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    const kyc = await KYC.findByIdAndUpdate(
      id,
      {
        status: "Complete",
        fileUrl: `/uploads/${file.filename}`,
      },
      { new: true }
    );

    // ✅ Update related invoice using leadId
    // ✅ Update related invoice using leadId
if (kyc && kyc.leadId) {
  const updatedInvoice = await Invoice.findOne({ leadId: kyc.leadId });

  if (updatedInvoice) {
    updatedInvoice.kycStatus = "Complete";
    await updatedInvoice.save();
    console.log("✅ Invoice updated with KYC Complete");
  } else {
    console.warn("⚠️ No invoice found for leadId:", kyc.leadId);
  }
}


    res.json({ success: true });
  } catch (err) {
    console.error("KYC upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};





exports.updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params; // KYC _id
    const { status } = req.body; // "Complete" or "Pending"

    const kyc = await KYC.findByIdAndUpdate(id, { status }, { new: true });

    // 🔄 Also update invoice.kycStatus based on leadId
    if (kyc && kyc.leadId) {
      const updatedInvoice = await Invoice.findOneAndUpdate(
        { leadId: kyc.leadId },
        { $set: { kycStatus: status } },   // ✅ Use $set explicitly
        { new: true }
      );

      console.log("✅ Invoice updated with KYC:", updatedInvoice?.kycStatus);
    }

    res.json({ success: true, message: `KYC marked as ${status}` });
  } catch (err) {
    console.error("❌ KYC update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
