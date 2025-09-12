// controllers/ftassignmentcontroller.js
const mongoose = require('mongoose');
const FTAssignment = require('../models/FTAssignment');
const Lead = require('../models/LeadUpload')
const { ACCOUNT_ID } = require("../../crm-frontend/src/constants/profiles");



// helper: Sunday skip karke n din baad ki date nikaalna
const getNextWorkingDay = (date) => {
  let d = new Date(date);
  d.setDate(d.getDate() + 1); // kal se shuru karo
  if (d.getDay() === 0) {  // Sunday skip
    d.setDate(d.getDate() + 1);
  }
  return d;
};

exports.assignFT = async (req, res) => {
  try {

    console.log("👉 AssignFT Body:", req.body);
    const { leadId, webLeadId, selectedFt, fromDate, toDate } = req.body;
    const userId = req.user._id;

    let savedAssignments = [];

    if (selectedFt && selectedFt.length > 0) {
      // 🟢 Case 1: Normal FT assignment with products
      const assignments = selectedFt.map(pid => ({
        leadId,
        productId: pid,
         webLeadId,
        leadSourceId: req.body.leadSourceId,
        fromDate,
        toDate,
        status: "Pending",
        raisedBy: userId,
      }));

      savedAssignments = await FTAssignment.insertMany(assignments);
    } else {
      // 🟢 Case 2: Convert to FT (signup → FT), no product, auto date
      const today = new Date();

  const fromD = getNextWorkingDay(today);   // kal ya Monday
  const toD = getNextWorkingDay(fromD);     // fromD ke baad ka agla valid din

  const newFT = new FTAssignment({
    leadId,
    fromDate: fromD,
    toDate: toD,
    status: "Pending",
    raisedBy: userId,
  });

  const saved = await newFT.save();
  savedAssignments = [saved];
}
    // populate karke bhejo
    const populated = await FTAssignment.find({ _id: { $in: savedAssignments.map(a => a._id) } })
      .populate("leadId", "name mobile")
      
       .populate("webLeadId", "name phone")
      .populate("productId", "productName")

      .populate("raisedBy", "name username");

    global.io.emit("newFTAssigned", populated);
    global.io.emit("pendingCountsUpdated");

    res.status(201).json({ message: "FT assigned successfully", data: populated });
  } catch (err) {
    console.error("FT Save Error:", err);
    res.status(500).json({ error: "Failed to assign FT" });
  }
};


// GET - All pending Free Trials for admin approval
exports.getPendingFTApprovals = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const userProfileId = req.user?.profileId?.toString();
    const userId = req.user?._id;

    let filter = { status: 'Pending' };

    // ✅ Admin + Accounts → full access
    if (userRole !== "admin" && userProfileId !== ACCOUNT_ID) {
      filter.raisedBy = userId;
    }

    const data = await FTAssignment.find(filter)
      .populate({ path: 'leadId', select: 'name mobile' })
      .populate({ path: 'productId', select: 'productName' })
      .populate({ path: 'raisedBy', select: 'name username' });

    res.json(data);
  } catch (err) {
    console.error("Error fetching pending FT approvals:", err);
    res.status(500).json({ error: "Server error" });
  }
};







exports.getFTByLeadId = async (req, res) => {
  try {
    const entries = await FTAssignment.find({ leadId: req.params.leadId })
      .populate('productId');
    res.json(entries);
  } catch (err) {
    console.error("Fetch by LeadID Error:", err);
    res.status(500).json({ error: 'Failed to fetch FT entries' });
  }
};

// POST - Bulk approve/deny
exports.bulkUpdateFTStatus = async (req, res) => {
  const { ids, status } = req.body;

  try {
    await FTAssignment.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.json({ message: `Free Trial(s) ${status}` });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// GET - All FT (for admin table with status: pending/running/completed)
exports.getAllFTAssignments = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const userProfileId = req.user?.profileId?.toString();
    const userId = req.user?._id;

    let filter = {};

    // ✅ Admin + Accounts → full access
    if (userRole !== "admin" && userProfileId !== ACCOUNT_ID) {
      filter.raisedBy = userId; // normal user → sirf apna
    }

    const data = await FTAssignment.find(filter)
      .populate({
        path: 'leadId',
        select: 'name mobile',
        populate: { path: 'assignedTo', select: 'name' }
      })
      .populate('leadSourceId', 'name')
      .populate("webLeadId", "name phone") 
      .populate('raisedBy', 'name username')
      .populate('productId', 'productName');

    res.json(data);
  } catch (err) {
    console.error("❌ FT fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch FT entries' });
  }
};


// ftassignmentcontroller.js
exports.getUserFTAssignments = async (req, res) => {
  try {
    const userId = req.params.userId;

    const all = await FTAssignment.find({
      $or: [
        { raisedBy: userId },
        { /* matches leads assigned to this user */ }
      ]
    })
    .populate({
      path: 'leadId',
      select: 'name mobile assignedTo'
    })
    .populate('productId');

    // Optional: filter to keep only FTs where lead is also assigned to this user
    const filtered = all.filter(ft => ft.leadId?.assignedTo?.toString() === userId || ft.raisedBy?.toString() === userId);

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching user's FT:", err);
    res.status(500).json({ error: "Server error" });
  }
};
