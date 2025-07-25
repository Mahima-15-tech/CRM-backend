const Lead = require("../models/LeadUpload");
const EmployeeData = require("../models/employeedata");
const FTAssignment = require("../models/FTAssignment");
const Payment = require("../models/Payment");

exports.getWorkReport = async (req, res) => {
  console.log("⭐ getWorkReport controller called");

  try {
    const { fromDate, toDate, profile, employee } = req.query;

    let from = null;
    let to = null;

   if (fromDate && toDate) {
from = new Date(fromDate + 'T00:00:00');
to = new Date(toDate + 'T23:59:59');

  console.log("Using date range (forced UTC):", from, "to", to);
}


    const empQuery = {};
    if (profile) empQuery.profile = profile;
    if (employee) empQuery._id = employee;

    console.log("Employee query filter:", empQuery);

    const employees = await EmployeeData.find(empQuery).populate("profile", "name");
    console.log(`🔍 Found ${employees.length} employees`);

    const report = [];

    for (const emp of employees) {
      const assignedToId = emp._id;    // for Lead.assignedTo
      const userId = emp.user;         // for Payment.raisedBy

      console.log("=====================================");
      console.log("▶ Employee:", emp.name, "(Profile:", emp.profile?.name, ")");
      console.log("assignedToId (EmployeeData._id):", assignedToId.toString());
      console.log("userId (User._id):", userId?.toString());

      // --- FETCHED LEADS ---
     // ✅ fetched leads (createdAt filter)
const fetchedLeads = await Lead.find({
  assignedTo: emp._id,
  ...(from && to && { createdAt: { $gte: from, $lte: to } })
});
const fetchedCount = fetchedLeads.length;

// ✅ modified leads (updatedAt filter)
const modifiedLeads = await Lead.find({
  assignedTo: emp._id,
  ...(from && to && { updatedAt: { $gte: from, $lte: to } })
});
const modifiedCount = modifiedLeads.length;

// ✅ empLeadIds
const empLeadIds = await Lead.find({ assignedTo: emp._id }).distinct("_id");

// ✅ FT count
const ftCount = await FTAssignment.countDocuments({
  leadId: { $in: empLeadIds },
  ...(from && to && { createdAt: { $gte: from, $lte: to } })
});

// ✅ payment aggregation
const paymentAgg = await Payment.aggregate([
  {
    $match: {
      raisedBy: userId,
      ...(from && to && { createdAt: { $gte: from, $lte: to } })
    }
  },
  { $group: { _id: null, total: { $sum: "$totalPaid" } } }
]);
const paymentTotal = paymentAgg[0]?.total || 0;


      // --- Build report ---
      report.push({
        employeeId: emp._id,
        employeeName: `${emp.name} (${emp.profile?.name || ""})`,
        fetched: fetchedCount,
        modified: modifiedCount,
        ft: ftCount,
        payment: paymentTotal,
      });
    }

    console.log("✅ Final report:", JSON.stringify(report, null, 2));

    res.json(report);

  } catch (err) {
    console.error("❌ getWorkReport error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
