// controllers/ftassignmentcontroller.js
const mongoose = require('mongoose');
const FTAssignment = require('../models/FTAssignment');
const Lead = require('../models/LeadUpload')


// controller/ftassignmentcontroller.js
exports.assignFT = async (req, res) => {
  try {
    const { leadId, selectedFt, fromDate, toDate } = req.body;
    const userId = req.user._id;

    const assignments = selectedFt.map(pid => ({
      leadId,
      productId: pid,
      leadSourceId: req.body.leadSourceId,
      fromDate,
      toDate,
      status: 'Pending',
      raisedBy: userId,
    }));

    // Pehle save karo
    const savedAssignments = await FTAssignment.insertMany(assignments);

    // Ab inhe populate karke naya data banao
    const populated = await FTAssignment.find({ _id: { $in: savedAssignments.map(a => a._id) } })
      .populate('leadId', 'name mobile')
      .populate('productId', 'productName')
      .populate('raisedBy', 'name username');

    // Ab frontend ko emit karo populated data
    global.io.emit('newFTAssigned', populated);


    global.io.emit('pendingCountsUpdated');
    res.status(201).json({ message: 'FT assigned successfully' });
  } catch (err) {
    console.error('FT Save Error:', err);
    res.status(500).json({ error: 'Failed to assign FT' });
  }
};



// GET - All pending Free Trials for admin approval
exports.getPendingFTApprovals = async (req, res) => {
  try {
    const data = await FTAssignment.find({ status: 'Pending' })
  .populate({
    path: 'leadId',
    select: 'name mobile'
  })
  .populate({
    path: 'productId',
    select: 'productName'
  })
  .populate({
    path: 'raisedBy',
    select: 'name username' // ✅ so you can show owner
  });


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
// GET - All FT for admin
exports.getAllFTAssignments = async (req, res) => {
  try {
    const data = await FTAssignment.find()
  .populate({
    path: 'leadId',
    select: 'name mobile',
    populate: { path: 'assignedTo', select: 'name' }
  })
  .populate('leadSourceId', 'name')
  .populate('raisedBy', 'name username')
  .populate('productId', 'productName');

    res.json(data); // Admin gets all
  } catch (err) {
    console.error("❌ FT fetch error (Admin):", err);
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
