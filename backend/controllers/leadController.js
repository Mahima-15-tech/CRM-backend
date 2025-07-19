const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Lead = require("../models/LeadUpload");
const EmployeeData = require('../models/employeedata');
const LeadSource = require('../models/LeadSource');
const TodaysFollowUp = require("../models/TodaysFollowUp");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const KYC = require("../models/KYC");
const moment = require("moment");
const User = require("../models/User");


//   const { leadSource, employee, columnMap, leadType } = req.body;
//   const map = JSON.parse(columnMap);
//   const results = [];
//   const duplicates = [];

//   if (!leadSource && !employee) {
//     return res.status(400).json({ error: "Please select either employee or lead source" });
//   }

//   let totalRows = 0;

//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on("data", (row) => {
//       totalRows++;

//       const keys = Object.keys(row);
//       const name = row[keys[map.name]]?.trim();
//       const mobile = row[keys[map.mobile]]?.trim();

//       if (!name || !mobile) return;

//       if (results.find((r) => r.mobile === mobile)) {
//         duplicates.push({ name, mobile });
//       } else {
//         results.push({
//           name,
//           email: row[keys[map.email]]?.trim() || "",
//           mobile,
//           city: row[keys[map.city]]?.trim() || "",
//           address: row[keys[map.address]]?.trim() || "",
//           segment: row[keys[map.segment]]?.trim() || "",
//           occupation: row[keys[map.occupation]]?.trim() || "",
//           investment: row[keys[map.investment]]?.trim() || "",
//           leadType: leadType || "Fresh",
//           leadSource: leadSource || null,
//            employee: employeeData?._id || null,
//           assignedTo: employeeData?._id || null
//         });
//       }
//     })
//     .on("end", async () => {
//       await Lead.insertMany(results);
//       res.json({
//         success: true,
//         totalLeadsInserted: results.length,
//         duplicateLeads: duplicates,
//         totalRows,
//         skipped: totalRows - results.length - duplicates.length,
//       });
//     });
// };

exports.uploadLeads = async (req, res) => {
  const { leadSource, employee, columnMap, leadType } = req.body;
  const map = JSON.parse(columnMap);
  const results = [];
  const duplicates = [];

  if (!leadSource && !employee) {
    return res.status(400).json({ error: "Please select either employee or lead source" });
  }

  let totalRows = 0;
  const fileRows = [];

  // Step 1: Read rows
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      totalRows++;
      fileRows.push(row);
    })
    .on("end", async () => {
      // Step 2: Find employeeData from user ID
      let employeeData = null;
      if (employee) {
        employeeData = await EmployeeData.findOne({ user: employee });
      }

      // Step 3: Build result rows
      for (const row of fileRows) {
        const keys = Object.keys(row);
        const name = row[keys[map.name]]?.trim();
        const mobile = row[keys[map.mobile]]?.trim();
        if (!name || !mobile) continue;

        if (results.find((r) => r.mobile === mobile)) {
          duplicates.push({ name, mobile });
        } else {
          results.push({
            name,
            email: row[keys[map.email]]?.trim() || "",
            mobile,
            city: row[keys[map.city]]?.trim() || "",
            address: row[keys[map.address]]?.trim() || "",
            segment: row[keys[map.segment]]?.trim() || "",
            occupation: row[keys[map.occupation]]?.trim() || "",
            investment: row[keys[map.investment]]?.trim() || "",
            leadType: leadType || "Fresh",
            leadSource: leadSource || null,
            employee: employeeData?._id || null,
            assignedTo: employeeData?.user || null,
            createdAt: new Date(), // ✅ Add this
  assignedDate: employeeData ? new Date() : null ,
          });
        }
      }

      await Lead.insertMany(results);
      res.json({
        success: true,
        totalLeadsInserted: results.length,
        duplicateLeads: duplicates,
        totalRows,
        skipped: totalRows - results.length - duplicates.length,
      });
    });
};



exports.getLeadTypeCounts = async (req, res) => {
  try {
    const source = await LeadSource.findOne({ name: req.params.sourceId });
    if (!source) return res.status(404).json({ error: "Source not found" });

    const counts = await Lead.aggregate([
      {
        $match: {
          leadSource: source._id,
        },
      },
      {
        $group: {
          _id: "$leadType",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Premium: 0,
      HNI: 0,
      Web: 0,
      Fresh: 0,
      SEO: 0,
    };

    counts.forEach((item) => {
      if (result[item._id] !== undefined) {
        result[item._id] = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error in getLeadTypeCounts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getTotalLeadTypeCounts = async (req, res) => {
  try {
    const counts = await Lead.aggregate([
      {
        $group: {
          _id: "$leadType",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Premium: 0,
      HNI: 0,
      Web: 0,
      Fresh: 0,
      SEO: 0,
    };

    counts.forEach((item) => {
      if (result[item._id] !== undefined) {
        result[item._id] = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error in getTotalLeadTypeCounts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getFilteredLeads = async (req, res) => {
  try {
    const { leadSource, profile, employee } = req.query;

    const query = {};

    if (leadSource) {
      const source = await LeadSource.findById(leadSource);
      if (!source) return res.status(404).json({ message: "Lead source not found" });
      query.leadSource = leadSource;
    }

    if (employee) {
      query.assignedTo = employee;
    } else if (profile) {
      const employees = await EmployeeData.find({ profile }).select('_id');
      const ids = employees.map(e => e._id);
      query.assignedTo = { $in: ids };
    }

    const leads = await Lead.find(query)
      .populate('leadSource', 'name')
      .populate('assignedTo', 'name');

    res.json(leads);
  } catch (err) {
    console.error("getFilteredLeads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getLeadCount = async (req, res) => {
  try {
    const sourceId = req.params.empId;

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({ error: "Invalid lead source ID" });
    }

    const count = await Lead.countDocuments({
      leadSource: sourceId,
      assignedTo: null
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error counting leads' });
  }
};


// Controller: fetchLeadsFromPool
exports.fetchLeadsFromPool = async (req, res) => {
  try {
    const userId = req.user.id;
    const { source } = req.body;

    const sourceDoc = await LeadSource.findOne({ name: source });
    if (!sourceDoc) {
      return res.status(404).json({ error: "Lead source not found" });
    }

    const leads = await Lead.find({
      assignedTo: null,
      leadSource: sourceDoc._id,
    }).sort({ createdAt: 1 }).limit(20);

    if (leads.length === 0) {
      return res.status(200).json({ message: "No leads available to fetch", leads: [] });
    }

    const leadIds = leads.map(l => l._id);
    const employee = await EmployeeData.findOne({ user: userId });

    await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: {
          assignedTo: employee?._id || null,
          employee: employee?._id || null,
          assignedDate: new Date(),
          leadStatus: "New"
        }
      }
    );

    const updatedLeads = await Lead.find({ _id: { $in: leadIds } })
      .populate("leadSource")
      .populate("assignedTo", "name")  // optional
      .populate("employee", "name");   // optional

    res.status(200).json({
      message: "Leads fetched successfully",
      leads: updatedLeads,
    });
  } catch (err) {
    console.error("Fetch from pool error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getLeadsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const status = req.query.status; // New or Old

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // ✅ Step 1: find employee data
    const employee = await EmployeeData.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee data not found" });
    }

    const filter = { assignedTo: employee._id };
    if (status) {
      filter.leadStatus = status; // "New" or "Old"
    }

    const leads = await Lead.find(filter)
      .populate("leadSource", "name")
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email" }
      })
      .populate({
        path: "employee",
        populate: { path: "user", select: "name email" }
      });

    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching user leads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// exports.allotLeads = async (req, res) => {
//   try {
//     const { leadIds, employeeId } = req.body;

//     if (!Array.isArray(leadIds) || leadIds.length === 0 || !employeeId) {
//       return res.status(400).json({ message: "Invalid payload" });
//     }

//     const result = await Lead.updateMany(
//       { _id: { $in: leadIds } },
//       {
//         $set: {
//           assignedTo: employeeId,
//           employee: employeeId
//         }
//       }
//     );

//     res.status(200).json({
//       message: "Leads allotted successfully",
//       matched: result.matchedCount,
//       modified: result.modifiedCount
//     });
//   } catch (err) {
//     console.error("Error in allotLeads:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.allotLeads = async (req, res) => {
  try {
    const { leadIds, employeeId } = req.body;
    console.log("➡️ leadIds:", leadIds);
    console.log("➡️ employeeId:", employeeId);

    if (!Array.isArray(leadIds) || leadIds.length === 0 || !employeeId) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const employee = await EmployeeData.findById(employeeId);
    console.log("➡️ employee:", employee);

    if (!employee || !employee.user) {
      return res.status(404).json({ message: "Employee or linked user not found" });
    }

    const userId = employee.user; 
    console.log("➡️ userId:", userId);

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: {
          assignedTo: userId,
          employee: employee._id
        }
      }
    );
    console.log("✅ updateMany result:", result);

    res.status(200).json({
      message: "Leads allotted successfully",
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
  } catch (err) {
    console.error("Error in allotLeads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getLeadCount = async (req, res) => {
  try {
    const sourceId = req.params.empId;

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({ error: "Invalid lead source ID" });
    }

    const count = await Lead.countDocuments({
      leadSource: sourceId,
      assignedTo: null
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error counting leads' });
  }
};


exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
  .populate("leadSource", "name")
  .populate({
    path: "assignedTo",
    populate: {
      path: "user",
      model: "User",
      select: "name"
    }
  })
  .populate({
  path: "employee",
  populate: {
    path: "user",
    model: "User",
    select: "name",
  },
})



    res.json(leads);
  } catch (err) {
    console.error("Error in getAllLeads:", err);
    res.status(500).json({ error: "Failed to fetch all leads" });
  }
};


exports.getLeadsForEmployee = async (req, res) => {
  try {
    const leads = await Lead.find({ assignedTo: req.params.employeeId })
      .populate("employee", "name")
.populate("assignedTo", "name profile");


    res.json(leads);
  } catch (error) {
    console.error("Error in getLeadsForEmployee:", error);
    res.status(500).json({ error: "Failed to fetch employee leads" });
  }
};

// Controller: getUnassignedSourceCounts
// Controller: getUnassignedSourceCounts
exports.getUnassignedSourceCounts = async (req, res) => {
  try {
    const counts = await Lead.aggregate([
      {
        $match: {
          assignedTo: null,
          leadSource: { $ne: null }
        }
      },
      {
        $lookup: {
          from: "leadsources", // ✅ collection name in MongoDB (must be lowercase & plural usually)
          localField: "leadSource",
          foreignField: "_id",
          as: "sourceDetails"
        }
      },
      {
        $unwind: "$sourceDetails"
      },
      {
        $group: {
          _id: "$sourceDetails.name", // 👈 use the lead source's name
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          source: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(counts);
  } catch (err) {
    console.error("Error fetching unassigned source counts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getLeadSourceCounts = async (req, res) => {
  try {
    const sources = await LeadSource.find();
    const counts = await Promise.all(
      sources.map(async (source) => {
        const total = await Lead.countDocuments({ leadSource: source._id });
        return { source: source.name, total };
      })
    );

    res.json(counts);
  } catch (error) {
    console.error("Error in getLeadSourceCounts:", error);
    res.status(500).json({ error: "Failed to fetch lead source counts" });
  }
};

exports.getAvailableSourceCounts = async (req, res) => {
  try {
    const sources = await LeadSource.find();

    const counts = await Lead.aggregate([
      { $match: { assignedTo: null } },
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    counts.forEach(({ _id, count }) => {
      countMap[_id.toString()] = count;
    });

    const result = sources.map((src) => ({
      _id: src._id,
      name: src.name,
      count: countMap[src._id.toString()] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error in getAvailableSourceCounts:", err);
    res.status(500).json({ error: "Failed to fetch source counts" });
  }
};


// Update lead response & mark as old
exports.updateLeadResponse = async (req, res) => {
  try {
    const { response, comment, employee } = req.body;
    const leadId = req.params.leadId;

    // ✅ Step: confirm employee really is EmployeeData ID, not user ID
    let empData = await EmployeeData.findById(employee);
    if (!empData) {
      // maybe employee is user ID, try to find employeeData by user
      empData = await EmployeeData.findOne({ user: employee });
    }

    if (!empData) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const updated = await Lead.findByIdAndUpdate(
      leadId,
      {
        response,
        comment,
        leadStatus: "Old",
        isOld: true,
        employee: empData._id   // ✅ Always use EmployeeData ID
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead updated successfully", lead: updated });
  } catch (err) {
    console.error("Error in updateLeadResponse:", err);
    res.status(500).json({ message: "Server error" });
  }
};






// Backend - inside leadController.js

exports.getOldLeadsByUser = async (req, res) => {
  const { userId } = req.params;
  const { leadSource, response, mobile, dateFrom, dateUpto } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    // ✅ Step 1: find EmployeeData by userId
    const employee = await EmployeeData.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee data not found" });
    }

    const filter = {
      employee: employee._id,   // ✅ EmployeeData._id
      isOld: true,
    };

    // Optional filters
    if (leadSource) filter.leadSource = leadSource;
    if (response) filter.response = { $regex: new RegExp(response, 'i') };
    if (mobile) filter.mobile = { $regex: new RegExp(mobile, 'i') };

    if (dateFrom && dateUpto) {
      filter.updatedAt = { $gte: new Date(dateFrom), $lte: new Date(dateUpto) };
    } else if (dateFrom) {
      filter.updatedAt = { $gte: new Date(dateFrom) };
    } else if (dateUpto) {
      filter.updatedAt = { $lte: new Date(dateUpto) };
    }

    const leads = await Lead.find(filter)
      .populate({
        path: "employee",
        populate: { path: "user", select: "name" }
      })
      .populate("leadSource", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching old leads:", err);
    res.status(500).json({ message: "Failed to fetch old leads" });
  }
};






// ✅ controllers/leadController.js

// exports.getAllOldLeads = async (req, res) => {
//   const { leadSource, profile, employee, response, mobile, dateFrom, dateUpto } = req.query;

//   const filter = { isOld: true };

//   if (leadSource) filter.leadSource = leadSource;
//   if (employee && mongoose.Types.ObjectId.isValid(employee)) filter.employee = employee;
//   if (profile) filter.profileId = profile;
//   if (response) filter.response = { $regex: new RegExp(response, "i") };
//   if (mobile) filter.mobile = mobile;

//   if (dateFrom && dateUpto) {
//     filter.updatedAt = { $gte: new Date(dateFrom), $lte: new Date(dateUpto) };
//   }

//   try {
//     const leads = await Lead.find(filter)
//   .populate("leadSource")
//   .populate({
//     path: "employee",
//     model: "EmployeeData",
//     populate: {
//       path: "user",
//       model: "User",
//       select: "name",
//     },
//   })

//       .sort({ updatedAt: -1 });
//       console.log("Sample lead:", leads[0]);


//     res.status(200).json(leads);
//   } catch (err) {
//     console.error("Error fetching old leads:", err);
//     res.status(500).json({ message: "Failed to fetch old leads" });
//   }
// };


exports.getAllOldLeads = async (req, res) => {
  const { leadSource, profile, employee, response, mobile, dateFrom, dateUpto, team } = req.query;

  const filter = { isOld: true };

  if (leadSource) filter.leadSource = leadSource;
  if (employee && mongoose.Types.ObjectId.isValid(employee)) {
    filter.employee = employee;
  }

  // ✅ Profile or Team-based filtering
 if (profile || team) {
  const empMatch = {};
  if (profile) empMatch.profile = profile;
  if (team) empMatch.team = team;

  const employees = await EmployeeData.find(empMatch).select("_id");
  const employeeIds = employees.map(emp => emp._id);
  filter.employee = { $in: employeeIds };
}


  if (response) filter.response = { $regex: new RegExp(response, "i") };
  if (mobile) filter.mobile = { $regex: new RegExp(mobile, "i") };

  if (dateFrom || dateUpto) {
    filter.updatedAt = {};
    if (dateFrom) filter.updatedAt.$gte = new Date(dateFrom);
    if (dateUpto) filter.updatedAt.$lte = new Date(dateUpto);
  }

  try {
    const leads = await Lead.find(filter)
  .populate("leadSource")
  .populate({
    path: "employee",
    model: "EmployeeData",
    populate: { path: "user", model: "User", select: "name" },
  })
  .populate({
    path: "assignedTo",
    model: "EmployeeData",
    populate: { path: "user", model: "User", select: "name" },
  })
  .sort({ updatedAt: -1 });


    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching old leads:", err);
    res.status(500).json({ message: "Failed to fetch old leads" });
  }
};



// exports.saveTodaysFollowUp = async (req, res) => {
//   try {
//     const { leadId, name, mobile, leadSource, date, time } = req.body;

//     if (!leadId || !name || !mobile || !leadSource || !date || !time) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // ✅ Extract employee from token
//     const username = req.user.username;
//     const employee = await Employee.findOne({ username });

//     if (!employee) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     // ✅ Create follow-up with real employee ID
//     const followUp = new TodaysFollowUp({
//       lead: leadId,
//       employee: employee._id,
//       name,
//       mobile,
//       leadSource,
//       date,
//       time,
//     });

//     await followUp.save();

//     // ✅ Mark lead as old
//     await Lead.findByIdAndUpdate(leadId, {
//       isOld: true,
//       leadStatus: "Old",
//     });

//     res.status(201).json({ success: true, message: "Follow-up scheduled successfully" });

//   } catch (err) {
//     console.error("Error saving follow-up:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.saveTodaysFollowUp = async (req, res) => {
//   try {
//     const { leadId, employeeId, name, mobile, leadSource, date, time } = req.body;

//     if (!leadId || !employeeId || !name || !mobile || !leadSource || !date || !time) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const followUp = new TodaysFollowUp({
//       lead: leadId,
//       employee: employeeId,
//       name,
//       mobile,
//       leadSource,
//       date,
//       time,
//     });

//     await followUp.save();

//     // ✅ Optionally get current employee name
//     const emp = req.user?.username || "N/A";
//     console.log(`✅ Follow-up saved by: ${emp}`);

//     await Lead.findByIdAndUpdate(leadId, {
//       isOld: true,
//       leadStatus: "Old",
//     });

//     res.status(201).json({ success: true, message: "Follow-up scheduled successfully" });

//   } catch (err) {
//     console.error("Error saving follow-up:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

exports.saveTodaysFollowUp = async (req, res) => {
  try {
    const { leadId, employeeId, name, mobile, leadSource, date, time } = req.body;

    if (!leadId || !employeeId || !name || !mobile || !leadSource || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Validate employeeId
    const empObjectId = new mongoose.Types.ObjectId(employeeId);

    console.log("✅ Follow-up saved by:", empObjectId);

    const followUp = new TodaysFollowUp({
      lead: leadId,
      employee: employeeId,
      name,
      mobile,
      leadSource,
      date,
      time,
    });

    await followUp.save();

    await Lead.findByIdAndUpdate(leadId, {
      isOld: true,
      leadStatus: "Old",
    });

    res.status(201).json({ success: true, message: "Follow-up scheduled successfully" });
  } catch (err) {
    console.error("❌ Error saving follow-up:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Fix for user's follow-up data (TodaysFollowUp)
exports.getTodaysFollowUps = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const followUps = await TodaysFollowUp.find({
      employee: employeeId,
      date: { $gte: today, $lt: tomorrow },
    }).populate("leadSource", "name");

    res.json(followUps);
  } catch (err) {
    console.error("Error fetching today's follow-ups:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET /api/todays-follow-up/user/:userId
  exports.getUserTodaysFollowUps = async (req, res) => {
    try {
      const { userId } = req.params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Find employeeData _id
      const employeeData = await EmployeeData.findOne({ user: userId });
      if (!employeeData) return res.status(404).json({ message: "Employee not found" });

      const followups = await TodaysFollowUp.find({
        employee: employee._id,
        date: { $gte: today, $lt: tomorrow }
      })
      .populate({
    path: "employee",
    populate: { path: "user", select: "name" }
  })
  .populate({
    path: "assignedTo",
    populate: { path: "user", select: "name" }
  })
          // ✅ get owner name
      .populate("leadSource", "name");        // ✅ get lead source name

      res.json(followups);
    } catch (err) {
      console.error("Error fetching today's follow-ups for user:", err);
      res.status(500).json({ message: "Server error" });
    }
  };





// controllers/todaysFollowUpController.js

exports.getAdminFollowUps = async (req, res) => {
  const { leadSource, response, mobile, fromDate, toDate, employee } = req.query;
  const query = {};

  if (leadSource) query.leadSource = { $regex: leadSource, $options: "i" };
  if (response) query.response = { $regex: response, $options: "i" };
  if (mobile) query.mobile = { $regex: mobile, $options: "i" };
  if (employee && mongoose.Types.ObjectId.isValid(employee)) {
    query.employee = employee;
  }
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);
  }

  try {
    const data = await TodaysFollowUp.find(query)
      .populate({
  path: "employee",
  model: "EmployeeData",
  populate: { path: "user", model: "User", select: "name" }
})
.populate({
  path: "assignedTo",
  model: "EmployeeData",
  populate: { path: "user", model: "User", select: "name" }
})
.populate("leadSource", "name")

      .sort({ date: -1 });

    res.json(data);
  } catch (err) {
    console.error("Error loading admin follow-ups:", err);
    res.status(500).json({ error: "Failed to load follow-ups" });
  }
};




exports.markLeadAsDND = async (req, res) => {
  try {
    const { leadId, employeeId, comment } = req.body;

    if (!leadId || !employeeId) {
      return res.status(400).json({ error: "Missing leadId or employeeId" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      {
        response: "Do Not Trade",
        leadStatus: "DND",
        comment: comment || "",
        employee: employeeId,  // ✅ This must be a valid ObjectId
      },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({
      message: "✅ Lead marked as DND",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("❌ Error marking lead as DND:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getDNDLeads = async (req, res) => {
  try {
   

    const dndLeads = await Lead.find({ leadStatus: "DND" })
  .populate("leadSource", "name")
  .populate({
    path: "employee", // or "assignedTo"
    model: "EmployeeData", // must match your model
    populate: {
      path: "user",
      model: "User",
      select: "name",
    },
  });
       // ✅ Get employee name (owner)

      console.log("DND Leads:", dndLeads); 

    res.status(200).json(dndLeads);
  } catch (err) {
    console.error("❌ Error fetching DND leads:", err);
    res.status(500).json({ error: "Failed to fetch DND leads" });
  }
};


exports.disposeLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    lead.leadStatus = "Disposed"; // ✅ correct field name

    if (!lead.assignedTo && req.body.employeeId) {
      lead.assignedTo = req.body.employeeId;
    }

    await lead.save();

    res.status(200).json({ message: "Lead disposed successfully" });
  } catch (err) {
    console.error("Dispose error:", err);
    res.status(500).json({ error: "Failed to dispose lead" });
  }
};




// 📂 controllers/leadcontroller.js
// 📂 controllers/leadcontroller.js

exports.getDisposedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ leadStatus: "Disposed" }) // ✅ correct field
      .populate("assignedTo", "name")
      .populate("leadSource", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json(leads);
  } catch (err) {
    console.error("❌ Failed to fetch disposed leads:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSingleLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate("leadSource", "name")
      .populate("assignedTo", "name")
      .populate("employee", "name");

    if (!lead) return res.status(404).json({ error: "Lead not found" });

    res.json(lead);
  } catch (err) {
    console.error("Error fetching lead:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

    if (!lead) return res.status(404).json({ error: "Lead not found" });

    res.json({ message: "Lead updated successfully", lead });
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ error: "Failed to update lead" });
  }
};


exports.getSummaryReport = async (req, res) => {
  try {
    const { source } = req.query;
    const match = {};

    if (source) {
      match.leadSource = source;
    }

    const allLeads = await Lead.find(match).populate("leadSource");

    const responseCounts = {};
    const statusCounts = {
      FT: 0,
      "FT Leads": 0,
      Disposed: 0,
      Deleted: 0,
      Unalloted: 0,
      "Fresh Leads": 0,
      Client: 0,
    };

    let total = 0;

    for (const lead of allLeads) {
      const res = (lead.response || "").toLowerCase().trim();

      if (!res) {
        statusCounts["Fresh Leads"]++;
        total++;
      } else {
        const label = res
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        responseCounts[label] = (responseCounts[label] || 0) + 1;
        total++;
      }

      if (lead.response === "FT" || lead.leadStatus === "FT") {
        statusCounts.FT++;
        total++;
      }

      if (lead.leadStatus === "Disposed") {
        statusCounts.Disposed++;
        total++;
      }

      if (lead.leadStatus === "Deleted") {
        statusCounts.Deleted++;
        total++;
      }

      if (!lead.assignedTo) {
        statusCounts.Unalloted++;
        total++;
      }
    }

    // ✅ Now fetch number of clients
    const approvedClients = await Payment.find({ status: "Approved" })
      .populate("leadId")
      .then(async (payments) => {
        let count = 0;
        for (let payment of payments) {
          const invoice = await Invoice.findOne({ paymentId: payment._id, status: "Running" });
          const kyc = await KYC.findOne({ leadId: payment.leadId?._id, status: "Approved" });

          if (
            invoice &&
            kyc &&
            (!source || (payment.leadId?.leadSource?.toString() === source))
          ) {
            count++;
          }
        }
        return count;
      });

    statusCounts.Client = approvedClients;
    total += approvedClients;

    res.json({ responseCounts, statusCounts, totalLeads: total });
  } catch (err) {
    console.error("❌ Summary Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/leadController.js

exports.deleteFieldsFromLeads = async (req, res) => {
  const { leadIds, deleteStory, deleteComment } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: "No leads selected" });
  }

  const updateFields = {};
  if (deleteStory) updateFields.story = "";
  if (deleteComment) updateFields.comment = "";

  try {
    await LeadUpload.updateMany(
      { _id: { $in: leadIds } },
      { $set: updateFields }
    );
    

    return res.status(200).json({ message: "Fields deleted successfully" });
  } catch (err) {
    console.error("Error deleting fields:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.transferBulkLeads = async (req, res) => {
  const {
    selectedResponses,
    leadSource,
    profileId,
    employeeId,
    leadSourceId,
    leadResponse,
    deleteStory,
    deleteComment,
    numberOfLeads,
  } = req.body;

  try {
    // ⛔ Validate required fields
    if (!Array.isArray(selectedResponses) || selectedResponses.length === 0) {
      return res.status(400).json({ error: "selectedResponses must be a non-empty array" });
    }

    if (!employeeId || !profileId) {
      return res.status(400).json({ error: "Missing profile or employee ID" });
    }

    // ✅ Build match conditions: filter by selectedResponses (response/status)
    const matchConditions = {
      $and: [
        {
          $or: selectedResponses.map((resp) => ({
            $or: [
              { response: { $regex: new RegExp(`^${resp}$`, "i") } },
              { status: { $regex: new RegExp(`^${resp}$`, "i") } },
            ],
          })),
        },
        ...(leadSource ? [{ leadSource }] : []),
      ],
    };

    const leads = await LeadUpload.find(matchConditions).limit(Number(numberOfLeads) || 1000);
    const leadIds = leads.map((lead) => lead._id);

    if (leadIds.length === 0) {
      return res.status(404).json({ error: "No matching leads found" });
    }

    // ✅ Prepare fields to update
    const updateFields = {
      assignedTo: employeeId,
      leadStatus: "New", // Mark transferred leads as new
    };

    if (leadSourceId) updateFields.leadSource = new mongoose.Types.ObjectId(leadSourceId);

    if (leadResponse) updateFields.response = leadResponse;
    if (deleteStory) updateFields.story = "";
    if (deleteComment) updateFields.comment = "";

    await LeadUpload.updateMany({ _id: { $in: leadIds } }, { $set: updateFields });

    res.status(200).json({
      success: true,
      updated: `${leadIds.length} leads transferred`,
    });
  } catch (err) {
    console.error("❌ Error in transferBulkLeads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// controllers/leadController.js
exports.disposeBulkLeads = async (req, res) => {
  const { leadIds, deleteStory, deleteComment } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: "No leads selected" });
  }

  const update = {
    leadStatus: "Disposed",     // ✅ this is the actual flag you're filtering on
    assignedTo: null,           // ✅ remove assignment
    assignedDate: null,         // ✅ optional cleanup
  };

  if (deleteStory) update.story = undefined;
  if (deleteComment) update.comment = undefined;

  try {
    await Lead.updateMany({ _id: { $in: leadIds } }, { $set: update });
    res.status(200).json({ message: "Leads disposed successfully" });
  } catch (err) {
    console.error("Error in bulk dispose:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};






// controllers/leadController.js
exports.deleteLeadsBulk = async (req, res) => {
  try {
    const { leadIds, deleteStory, deleteComment } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "No leadIds provided." });
    }

    const updateFields = {
      leadStatus: "Deleted",
    };

    if (deleteStory) updateFields.story = "";
    if (deleteComment) updateFields.comment = "";

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: updateFields }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount || 0} leads marked as Deleted.`,
    });
  } catch (error) {
    console.error("❌ deleteLeadsBulk error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/leadController.js

// ✅ Permanent Delete: Remove from DB completely
exports.permanentlyDeleteLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "No lead IDs provided" });
    }

    const result = await LeadUpload.deleteMany({ _id: { $in: leadIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} leads permanently deleted.`,
    });
  } catch (err) {
    console.error("❌ Permanent delete error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// controllers/leadController.js

exports.unallotLeads = async (req, res) => {
  const { leadIds, newSourceId, deleteStory, deleteComment } = req.body;
const ObjectId = require('mongoose').Types.ObjectId;


  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: "No leads selected" });
  }

 const updateFields = {
  assignedTo: null,
  assignedDate: null,
  response: null,
  comment: "",
  ...(newSourceId && { leadSource: new ObjectId(newSourceId) }) // 👈 convert to ObjectId
};


  if (deleteStory) updateFields.story = "";
  if (deleteComment) updateFields.comment = "";

  try {
    await LeadUpload.updateMany(
      { _id: { $in: leadIds } },
      { $set: updateFields }
    );

    res.json({ success: true, message: "Leads unallotted to pool" });
  } catch (err) {
    console.error("Unallot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/leadController.js
const { Parser } = require("json2csv");
const LeadUpload = require("../models/LeadUpload");

exports.exportLeads = async (req, res) => {
  const { leadIds } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: "No leads provided for export" });
  }

  try {
    const leads = await LeadUpload.find({ _id: { $in: leadIds } });

    const fields = ['name', 'mobile', 'email', 'response', 'comment', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leads_export.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Failed to export leads" });
  }
};


// leadcontroller.js
exports.getLeadsByResponse = async (req, res) => {
  const { responses, leadSource } = req.body;

  if (!Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: "No responses selected" });
  }

  const query = {
    response: { $in: responses },
    isDisposed: { $ne: true },
  };

  if (leadSource) {
    query.leadSource = leadSource;
  }

  try {
    const leads = await LeadUpload.find(query).select("_id");
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads by response:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// backend/controllers/leadController.js
exports.getLeadsForDisposal = async (req, res) => {
  try {
    const { selectedResponses, source, numberOfLeads } = req.body;

    if (!selectedResponses || selectedResponses.length === 0) {
      return res.status(400).json({ error: "No responses selected" });
    }

    const query = {
      isDisposed: { $ne: true },
      response: { $in: selectedResponses },
    };

    if (source) {
      query.leadSource = source;
    }

    const leads = await Lead.find(query)
      .limit(Number(numberOfLeads) || 9999)
      .select("_id");

    const leadIds = leads.map((l) => l._id);
    res.status(200).json({ leadIds });
  } catch (err) {
    console.error("Error fetching leads for disposal:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.softDeleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const lead = await LeadUpload.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully", lead });
  } catch (err) {
    console.error("Soft delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markLeadAsDeleted = async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await LeadUpload.findByIdAndUpdate(
      leadId,
      { isDeleted: true },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    res.status(200).json({ message: "Lead marked as deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// exports.getDeletedLeads = async (req, res) => {
//   try {
//     const leads = await LeadUpload.find({ isDeleted: true }).populate("assignedTo", "name");
//     const formatted = leads.map(l => ({
//       ...l._doc,
//       ownerName: l.assignedTo?.name || "N/A"
//     }));
//     res.json(formatted);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching deleted leads" });
//   }
// };

exports.getDeletedLeads = async (req, res) => {
  try {
    const leads = await LeadUpload.find({
      $or: [{ isDeleted: true }, { leadStatus: "Deleted" }]
    })
      .populate("assignedTo", "name")
      .populate("leadSource", "name");

    const formatted = leads.map(l => ({
      ...l._doc,
      ownerName: l.assignedTo?.name || "N/A"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching deleted leads", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLeadsBySource = async (req, res) => {
  try {
    const { source } = req.query;
    if (!source) return res.status(400).json({ error: "Missing source" });

    const leads = await Lead.find({
      leadSource: source,
      leadStatus: { $ne: "Deleted" }, // optional: exclude deleted
    });

    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads by source:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getLeadSourceSummary = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const monthStart = moment().startOf("month");

    const leadSources = await LeadSource.find(); // Assuming your model is LeadSource

    const result = await Promise.all(
      leadSources.map(async (source) => {
        const sourceId = source._id;

        const available = await LeadUpload.countDocuments({
          leadSource: sourceId,
          assignedTo: null,
          isDeleted: { $ne: true },
        });

        const todayUploaded = await LeadUpload.countDocuments({
          leadSource: sourceId,
          createdAt: { $gte: today.toDate() },
        });

        const monthUploaded = await LeadUpload.countDocuments({
          leadSource: sourceId,
          createdAt: { $gte: monthStart.toDate() },
        });

        const todayFetch = await LeadUpload.countDocuments({
          leadSource: sourceId,
          assignedDate: { $gte: today.toDate() },
        });

        const monthFetch = await LeadUpload.countDocuments({
          leadSource: sourceId,
          assignedDate: { $gte: monthStart.toDate() },
        });

        return {
          sourceId,
          sourceName: source.name,
          available,
          todayUploaded,
          monthUploaded,
          todayFetch,
          monthFetch,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Error in lead source summary:", err);
    res.status(500).json({ error: "Failed to generate lead source report" });
  }
};

// controllers/leadcontroller.js
// controllers/leadController.js
exports.getUploadReport = async (req, res) => {
  try {
    const { sourceId, startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full day

    // ✅ Uploaded leads by Admin
    const uploaded = await LeadUpload.countDocuments({
      leadSource: sourceId,
      createdAt: { $gte: start, $lte: end },
    });

    // ✅ Clients created by employees
    const clients = await LeadUpload.aggregate([
      {
        $match: {
          leadSource: new mongoose.Types.ObjectId(sourceId),
          createdAt: { $gte: start, $lte: end },
          assignedTo: { $ne: null }, // make sure assigned
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "employees", // or "users" collection
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: "$employee",
      },
      {
        $project: {
          name: "$employee.name",
          count: 1,
        },
      },
    ]);

    res.json({ uploaded, clients });
  } catch (err) {
    console.error("Upload report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEmployeeLeadSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { source, from, to } = req.query;

    const filter = {
      assignedTo: employeeId,
    };

    if (source && source !== "All") {
      filter.leadSource = source;
    }

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const leads = await Lead.find(filter);

    const responseCounts = {};
    const statusCounts = {};
    let totalLeads = 0;
    let clientCount = 0;
    let runningFTCount = 0;

    leads.forEach((lead) => {
      const response = lead.response || "Unknown";
      responseCounts[response] = (responseCounts[response] || 0) + 1;

      const status = lead.leadStatus || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (status === "Client") clientCount++;
      if (lead.leadType === "FT") runningFTCount++;

      totalLeads++;
    });

    res.json({
      summary: {
        responseCounts,
        statusCounts,
        totalLeads,
        runningFTCount, // ✅ added this line
      },
      clientCount,
    });
  } catch (err) {
    console.error("Error in getEmployeeLeadSummary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};





exports.getEmployeeLeadReport = async (req, res) => {
  try {
    const employees = await User.find({ role: "user" }).populate("profileId", "name");

    const report = await Promise.all(
      employees.map(async (emp) => {
        const leadCount = await Lead.countDocuments({ assignedTo: emp._id });
        return {
          _id: emp._id,
          name: emp.name,
          profile: emp.profileId?.name || "N/A",
          leads: leadCount,
        };
      })
    );

    res.json(report);
  } catch (err) {
    console.error("Employee report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// Fetch leads by employee + response + optional source/date
exports.getLeadsByResponse = async (req, res) => {
  try {
    const {
      responses,
      employeeId,
      leadSource,
      fromDate,
      toDate,
      limit
    } = req.body;

    const query = {
      assignedTo: employeeId,
      $or: [
        { response: { $in: responses } },
        { status: { $in: responses } }
      ]
    };

    if (leadSource) query.leadSource = leadSource;

    if (fromDate && toDate) {
      query.modifiedAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const leads = await Lead.find(query).limit(Number(limit) || 1000);
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads by response", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getNewLeadsCountByUser = async (req, res) => {
  try {
    const employeeId = req.params.userId; // keep param name same for now

    const count = await Lead.countDocuments({
      assignedTo: employeeId,
      $or: [
        { response: { $exists: false } },
        { response: "" },
        { response: "new" }
      ],
      leadStatus: "New" // optional: only count new status
    });

    res.json({ count });
  } catch (err) {
    console.error("Error counting new leads:", err);
    res.status(500).json({ message: "Error counting new leads" });
  }
};
