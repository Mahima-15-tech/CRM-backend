// controllers/webLeadController.js
const Lead = require('../models/LeadUpload')
const FTAssignment = require("../models/FTAssignment");
const WebLead = require("../models/weblead");

// get all leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await WebLead.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await WebLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ msg: "Web Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// update status (convert)
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "ft" or "client"

    const lead = await WebLead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.convertToFT = async (req, res) => {
  try {
    const { webLeadId, leadSourceId } = req.body;

    // 1. Get the WebLead
    const webLead = await WebLead.findById(webLeadId);
    if (!webLead) return res.status(404).json({ message: "WebLead not found" });

    // 2. Create Lead (copying data from WebLead)
    const lead = await Lead.create({
      name: webLead.name,
      mobile: webLead.phone,
      email: webLead.email,
      leadType: "Web",
      leadSource: leadSourceId || null,
    });

    // 3. Update WebLead status
    webLead.status = "ft";
    await webLead.save();

    // 4. Dates (next working day → fromDate, +2 days → toDate)
    const today = new Date();
    const fromDate = getNextWorkingDay(today); // ✅ next working day (skip Sunday)
    const toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 1);

    // 5. Create FT Assignment
    const ft = await FTAssignment.create({
      leadId: lead._id,
      webLeadId: webLead._id,
      fromDate,
      toDate,
      leadSourceId,
      raisedBy: req.user._id,
      status: "Pending"
    });

    res.json({ success: true, lead, ft });
  } catch (err) {
    console.error("❌ ConvertToFT Error:", err);
    res.status(500).json({ message: "Error converting to FT" });
  }
};

// Helper Function (top pe add kardo)
function getNextWorkingDay(startDate) {
  let next = new Date(startDate);
  next.setDate(next.getDate() + 1); // tomorrow
  if (next.getDay() === 0) { // 0 = Sunday
    next.setDate(next.getDate() + 1);
  }
  return next;
}


// update full lead
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await WebLead.findByIdAndUpdate(id, req.body, { new: true });
    if (!lead) return res.status(404).json({ msg: "WebLead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// dispose lead
exports.disposeLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, comment } = req.body;

    const lead = await WebLead.findByIdAndUpdate(
      id,
      { status: "disposed", response, comment },
      { new: true }
    );

    if (!lead) return res.status(404).json({ msg: "WebLead not found" });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// soft delete lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await WebLead.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );

    if (!lead) return res.status(404).json({ msg: "WebLead not found" });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
