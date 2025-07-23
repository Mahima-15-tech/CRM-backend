const express = require("express");
const multer = require("multer");
const leadController = require("../controllers/leadController");
const LeadUpload = require("../models/LeadUpload");
const LeadSource = require('../models/LeadSource');
const router = express.Router();
const { uploadLeads, getLeadTypeCounts,getLeadsBySource,getUserLeadStats, getLeadSourceSummary,markLeadAsDeleted,getDeletedLeads,softDeleteLead,getDNDLeads,disposeBulkLeads,getSummaryReport, disposeLead,getDisposedLeads,getSingleLead, updateLead, getLeadsByUser,getAllLeads,getLeadCount,allotLeads, getUserTodaysFollowUps,markLeadAsDND, getLeadsForEmployee,getUnassignedSourceCounts, getFilteredLeads, fetchLeadsFromPool,  getLeadSourceCounts, getTotalLeadTypeCounts, updateLeadResponse, getOldLeadsByUser,  getAllOldLeads , saveTodaysFollowUp, saveFollowUp, getTodaysFollowUps, getUserFollowUps, getAdminFollowUps, transferBulkLeads,deleteFieldsFromLeads,deleteBulkLeads,permanentlyDeleteLeads, unallotLeads,exportLeads,getLeadsByResponse , } = require("../controllers/leadController");
const { authenticateUser } = require("../middleware/authMiddleware");

const upload = multer({ dest: "uploads/" });

// Routesx
router.post("/upload", upload.single("csv"), uploadLeads);
router.get("/count/:sourceId", getLeadTypeCounts); 
router.get("/total-counts", getTotalLeadTypeCounts);
router.get("/all", getAllLeads);
router.get('/count/:empId', getLeadCount);
router.post('/allot', allotLeads);
router.get("/source-counts", getLeadSourceCounts);
router.get('/my-leads/:employeeId', getLeadsForEmployee);
router.get("/pool", getUnassignedSourceCounts);
router.post("/pool", authenticateUser, fetchLeadsFromPool);
router.get("/filtered", getFilteredLeads);
router.get("/available-sources", leadController.getAvailableSourceCounts);
router.get("/user/:userId", getLeadsByUser);
router.put("/update-response/:leadId", updateLeadResponse);
router.get("/old/:userId", getOldLeadsByUser); // For user
router.get("/old", getAllOldLeads);  
router.post("/todays-follow-up",saveTodaysFollowUp); 
router.post("/dnd", markLeadAsDND);
router.get("/dnd", getDNDLeads);
router.post('/dispose/:leadId', disposeLead);
router.get("/disposed",getDisposedLeads);
router.get("/summary-report",getSummaryReport);
router.patch("/delete-fields", deleteFieldsFromLeads);
router.post("/transfer-bulk", transferBulkLeads);
router.post("/dispose-bulk", disposeBulkLeads);
router.post("/delete-bulk", leadController.deleteLeadsBulk);
router.post("/permanent-delete", permanentlyDeleteLeads);
router.post("/unallot", unallotLeads);
router.post("/export", exportLeads);
router.post("/get-leads-by-response", getLeadsByResponse);
router.post("/get-leads-for-dispose", leadController.getLeadsForDisposal);
router.post("/delete/:id", softDeleteLead);
router.patch("/delete/:id", markLeadAsDeleted);
router.get("/deleted", getDeletedLeads);
router.get("/", getLeadsBySource);
router.get("/source-summary", getLeadSourceSummary);
router.get("/upload-report", leadController.getUploadReport);
router.get("/employee-summary/:employeeId", leadController.getEmployeeLeadSummary);
router.get("/employee-report", leadController.getEmployeeLeadReport);
router.post('/by-response', leadController.getLeadsByResponse);
router.get('/new-leads-count/:userId', leadController.getNewLeadsCountByUser);

// routes/leadRoutes.js or similar
router.get('/user/:userId/stats', getUserLeadStats);


// Get single lead by ID


// Update lead by ID
router.put("/:id", updateLead);

// Get today's follow-ups for logged-in user
// router.get('/todays-follow-up/user/:id', authenticateUser, getTodaysFollowUps);

router.get('/todays-follow-up/user/:id', authenticateUser, getUserTodaysFollowUps);




// routes/todaysFollowUpRoutes.js
router.get("/admin", authenticateUser, getAdminFollowUps);

         // For admin


router.get("/assigned/:employeeId", async (req, res) => {
  try {
    const leads = await LeadUpload.find({ assignedTo: req.params.employeeId });
    res.json(leads);
  } catch (error) {
    console.error("Error fetching assigned leads:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// For admin - all leads

// For users - their own leads only
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const leads = await LeadUpload.find({ userId: req.params.userId });
//     res.json(leads);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch user leads' });
//   }
// });


router.get('/employee/:userId', async (req, res) => {
  try {
    const leads = await LeadUpload.find({ assignedTo: req.params.userId }).populate('leadSource', 'name');
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching leads for this user' });
  }
});

// POST /api/leads/fetch
router.post("/fetch", async (req, res) => {
  try {
    const { leadSource, userId } = req.body;

    const source = await LeadSource.findOne({ name: leadSource });
    if (!source) {
      return res.status(404).json({ message: "Lead Source not found" });
    }

    const leadSourceId = source._id;

    const leads = await LeadUpload.find({
      leadSource: leadSourceId,
      assignedTo: null,
    }).limit(20);

    await Promise.all(
      leads.map(async (lead) => {
        lead.assignedTo = userId;
        await lead.save();
      })
    );

    res.status(200).json({ message: "Leads fetched successfully", leads });
  } catch (error) {
    console.error("Fetch failed:", error);
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});


router.get("/total-counts", async (req, res) => {
  try {
    const counts = await LeadUpload.aggregate([
      { $match: { assignedTo: null } },
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "leadsources", // Collection name
          localField: "_id",
          foreignField: "_id",
          as: "source"
        }
      },
      { $unwind: "$source" },
      {
        $project: {
          id: "$source._id",
          name: "$source.name",
          count: 1
        }
      }
    ]);

    res.json(counts); // returns [{ id, name, count }]
  } catch (err) {
    console.error("Error getting total counts:", err);
    res.status(500).json({ error: "Failed to fetch total counts" });
  }
});

router.get("/deleted", async (req, res) => {
  try {
    const deletedLeads = await LeadUpload.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.status(200).json(deletedLeads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deleted leads" });
  }
});

router.get('/by-source/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!sourceId) {
      return res.status(400).json({ message: "Missing lead source ID" });
    }

    // validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({ message: "Invalid lead source ID" });
    }

    // find unassigned leads for this source
    const leads = await LeadUpload.find({
      leadSource: sourceId,
      assignedTo: null
    })
    .limit(limit);

    res.json(leads);
  } catch (err) {
    console.error("❌ Error fetching unassigned leads:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/:id", getSingleLead);

module.exports = router;
