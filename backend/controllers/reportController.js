// controllers/reportController.js
const Lead = require("../models/LeadUpload");
const EmployeeData = require("../models/employeedata");
const FTAssignment = require("../models/FTAssignment");
const Payment = require("../models/Payment");

exports.getWorkReport = async (req, res) => {
  try {
    const { fromDate, toDate, profile, employee } = req.query;

    let from = null;
    let to = null;

    // ✅ Parse date filters if provided
    if (fromDate && toDate) {
      from = new Date(fromDate);
      to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      if (isNaN(from) || isNaN(to)) {
        return res.status(400).json({ error: "Invalid date range" });
      }
    }

    // ✅ Build employee filter
    const empQuery = {};
    if (profile) empQuery.profile = profile;
    if (employee) empQuery._id = employee;

    const employees = await EmployeeData.find(empQuery).populate("profile", "name");
    const report = [];

    for (const emp of employees) {
      const userId = emp.user;
      if (!userId) continue;

      // ✅ Count Fetched Leads
      const fetchedFilter = { assignedTo: userId };
      if (from && to) fetchedFilter.createdAt = { $gte: from, $lte: to };
      const fetchedCount = await Lead.countDocuments(fetchedFilter);

      // ✅ Count Modified Leads
      const modifiedFilter = { assignedTo: userId };
      if (from && to) modifiedFilter.updatedAt = { $gte: from, $lte: to };
      const modifiedCount = await Lead.countDocuments(modifiedFilter);

      // ✅ FT Count
      const empLeadIds = await Lead.find({ assignedTo: userId }).distinct("_id");
      const ftFilter = { leadId: { $in: empLeadIds } };
      if (from && to) ftFilter.createdAt = { $gte: from, $lte: to };
      const ftCount = await FTAssignment.countDocuments(ftFilter);

      // ✅ Payment Aggregation
      const paymentMatch = { raisedBy: userId };
      if (from && to) paymentMatch.createdAt = { $gte: from, $lte: to };
      const paymentAgg = await Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, total: { $sum: "$totalPaid" } } }
      ]);

      report.push({
        employeeId: emp._id,
        employeeName: `${emp.name} (${emp.profile?.name || ""})`,
        fetched: fetchedCount,
        modified: modifiedCount,
        ft: ftCount,
        payment: paymentAgg[0]?.total || 0,
      });
    }

    res.json(report);
  } catch (err) {
    console.error("getWorkReport error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
