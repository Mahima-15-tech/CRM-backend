const EmployeeData = require('../models/employeedata');
const Lead = require('../models/LeadUpload');
const TodaysFollowUp = require("../models/TodaysFollowUp");
const Payment = require("../models/Payment");
const FTAssignment = require("../models/FTAssignment");
const Team = require("../models/Team");

// ------------------- ADMIN DASHBOARD -------------------
// exports.getAdminDashboard = async (req, res) => {
//   try {
//     console.log("🚀 Starting getAdminDashboard...");

//     const employees = await EmployeeData.find({});
//     const employeeIds = employees.map(emp => emp._id);
//     console.log("🧑 employeeIds:", employeeIds);

//     const totalTarget = employees.reduce((sum, emp) => sum + (emp.target || 0), 0);
//     console.log("🎯 totalTarget:", totalTarget);

//     const achievedAgg = await Payment.aggregate([
//       { $match: { status: "Approved" } },
//       { $group: { _id: null, total: { $sum: "$totalPaid" } } }
//     ]);
//     const achievedTarget = achievedAgg[0]?.total || 0;
//     console.log("🏆 achievedTarget:", achievedTarget);

//     // ✅ IST date calculation
//     const now = new Date();
//     const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
//     const istDateStr = istNow.toISOString().split('T')[0];
//     const startOfDayIST = new Date(`${istDateStr}T00:00:00+05:30`);
//     const endOfDayIST = new Date(`${istDateStr}T23:59:59+05:30`);
//     console.log({
//       "🕒 now": now.toISOString(),
//       "🇮🇳 istNow": istNow.toISOString(),
//       "⏰ startOfDayIST": startOfDayIST.toISOString(),
//       "⏰ endOfDayIST": endOfDayIST.toISOString()
//     });

//     // ✅ Today's payment
//     const todaysPaymentAgg = await Payment.aggregate([
//       { $match: { status: "Approved", createdAt: { $gte: startOfDayIST, $lte: endOfDayIST } } },
//       { $group: { _id: null, total: { $sum: "$totalPaid" } } }
//     ]);
//     const todaysPayment = todaysPaymentAgg[0]?.total || 0;
//     console.log("💰 todaysPayment:", todaysPayment);
//     console.log("💰 todaysPaymentAgg:", todaysPaymentAgg);

//     // ✅ Today's followups
//     const followUps = await TodaysFollowUp.find({
//       employee: { $in: employeeIds },
//       date: { $gte: startOfDayIST, $lte: endOfDayIST }
//     });
//     const todayFollowUps = followUps.length;
//     console.log("📊 todayFollowUps count:", todayFollowUps);
//     console.log("📊 followUps:", followUps);

//     // ✅ Leads modified (with debug)
//     const modifiedLeads = await Lead.find({
//       employee: { $in: employeeIds },
//       isDeleted: false,
//       updatedAt: { $gte: startOfDayIST, $lte: endOfDayIST }
//     }).select("name updatedAt employee");
//     const leadsModified = modifiedLeads.length;
//     console.log("✏️ leadsModified count:", leadsModified);
//     console.log("✏️ modifiedLeads:", modifiedLeads);

//     // ✅ Pool leads
//     const poolLeads = await Lead.aggregate([
//       {
//         $match: {
//           employee: null,
//           leadStatus: { $ne: "Deleted" },
//           isDeleted: false
//         }
//       },
//       { $group: { _id: "$leadType", count: { $sum: 1 } } }
//     ]);
//     console.log("📦 poolLeads:", poolLeads);

//     const leadBalance = {};
//     poolLeads.forEach(item => { leadBalance[item._id] = item.count; });
//     console.log("📦 leadBalance:", leadBalance);

//     // ✅ Final response
//     console.log("✅ Sending response to frontend...");
//     res.json({
//       totalTarget,
//       achievedTarget,
//       todaysPayment,
//       todayFollowUps,
//       leadsModified,
//       leadBalance
//     });
//   } catch (err) {
//     console.error("🔥 Admin Dashboard Error:", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };


// exports.getAdminDashboard = async (req, res) => {
//   try {
//     console.log("🚀 Starting getAdminDashboard...");

//     const employees = await EmployeeData.find({});
//     const employeeIds = employees.map(emp => emp._id);
//     console.log("🧑 employeeIds:", employeeIds);

//     const totalTarget = employees.reduce((sum, emp) => sum + (emp.target || 0), 0);
//     console.log("🎯 totalTarget:", totalTarget);

//     // ✅ IST date calculation
//     const now = new Date();
//     const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
//     const istDateStr = istNow.toISOString().split('T')[0];
//     const startOfDayIST = new Date(`${istDateStr}T00:00:00+05:30`);
//     const endOfDayIST = new Date(`${istDateStr}T23:59:59+05:30`);

//     console.log({
//       "⏰ startOfDayIST": startOfDayIST.toISOString(),
//       "⏰ endOfDayIST": endOfDayIST.toISOString()
//     });

//     // ✅ Aaj kitni leads modified hui (any field updated)
//     const modifiedLeads = await Lead.find({
//       employee: { $in: employeeIds },
//       isDeleted: false,
//       updatedAt: { $gte: startOfDayIST, $lte: endOfDayIST }
//     }).select("name updatedAt employee");

//     const leadsModified = modifiedLeads.length;
//     console.log("✏️ leadsModified count:", leadsModified);

//     // ✅ Pool leads balance
//     const poolLeads = await Lead.aggregate([
//       {
//         $match: {
//           employee: null,
//           leadStatus: { $ne: "Deleted" },
//           isDeleted: false
//         }
//       },
//       { $group: { _id: "$leadType", count: { $sum: 1 } } }
//     ]);

//     const leadBalance = {};
//     poolLeads.forEach(item => { leadBalance[item._id] = item.count; });
//     console.log("📦 leadBalance:", leadBalance);

//     // ✅ Today’s follow-ups (optional)
//     const followUps = await TodaysFollowUp.find({
//       employee: { $in: employeeIds },
//       date: { $gte: startOfDayIST, $lte: endOfDayIST }
//     });
//     const todayFollowUps = followUps.length;
//     console.log("📊 todayFollowUps count:", todayFollowUps);

//     // ✅ Response
//     res.json({
//       totalTarget,
//       leadsModified,
//       todayFollowUps,
//       leadBalance
//     });
//   } catch (err) {
//     console.error("🔥 Admin Dashboard Error:", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };



// ------------------- ADMIN DASHBOARD -------------------
exports.getAdminDashboard = async (req, res) => {
  try {
    console.log("🚀 Starting getAdminDashboard...");

    const employees = await EmployeeData.find({});
    const employeeIds = employees.map(emp => emp._id);

    const totalTarget = employees.reduce((sum, emp) => sum + (emp.target || 0), 0);

    const achievedAgg = await Payment.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } }
    ]);
    const achievedTarget = achievedAgg[0]?.total || 0;

    // ✅ IST date calculation
    const now = new Date();
    const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const istDateStr = istNow.toISOString().split('T')[0];
    const startOfDayIST = new Date(`${istDateStr}T00:00:00+05:30`);
    const endOfDayIST = new Date(`${istDateStr}T23:59:59+05:30`);

    // ✅ Today's payment
    const todaysPaymentAgg = await Payment.aggregate([
      { $match: { status: "Approved", createdAt: { $gte: startOfDayIST, $lte: endOfDayIST } } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } }
    ]);
    const todaysPayment = todaysPaymentAgg[0]?.total || 0;

    // ✅ Today's followups
    const followUps = await TodaysFollowUp.find({
      employee: { $in: employeeIds },
      date: { $gte: startOfDayIST, $lte: endOfDayIST }
    });
    const todayFollowUps = followUps.length;

    // ✅ Leads modified today: only where responseModifiedAt is today
    const modifiedLeads = await Lead.find({
      employee: { $in: employeeIds },
      isDeleted: false,
      responseModifiedAt: { $gte: startOfDayIST, $lte: endOfDayIST }
    });
    const leadsModified = modifiedLeads.length;

    // ✅ Pool leads
    const poolLeads = await Lead.aggregate([
      {
        $match: {
          employee: null,
          leadStatus: { $ne: "Deleted" },
          isDeleted: false
        }
      },
      { $group: { _id: "$leadType", count: { $sum: 1 } } }
    ]);
    const leadBalance = {};
    poolLeads.forEach(item => { leadBalance[item._id] = item.count; });

    // ✅ Send to frontend
    res.json({
      totalTarget,
      achievedTarget,
      todaysPayment,
      todayFollowUps,
      leadsModified,
      leadBalance
    });

  } catch (err) {
    console.error("🔥 Admin Dashboard Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};





// ------------------- SBA DASHBOARD -------------------
// SBA Dashboard — Correct Achieved Target & Today's Sales (Amount)
exports.getSbaDashboard = async (req, res) => {
  try {
    const username = req.user.username;

    const emp = await EmployeeData.findOne({ username });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const userId = emp.user;
    if (!userId) return res.status(404).json({ message: "Linked user not found for employee" });

    // 🕒 Date range in IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istNow = new Date(now.getTime() + istOffset);
    const istDateStr = istNow.toISOString().split('T')[0];
    const startOfDay = new Date(`${istDateStr}T00:00:00+05:30`);
    const endOfDay = new Date(`${istDateStr}T23:59:59+05:30`);

    // ✅ Payments
    const totalAchieved = await Payment.aggregate([
      { $match: { raisedBy: userId, status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } }
    ]);
    const todayAchieved = await Payment.aggregate([
      {
        $match: {
          raisedBy: userId,
          status: "Approved",
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } }
    ]);
    const achievedTarget = totalAchieved[0]?.total || 0;
    const todaysSales = todayAchieved[0]?.total || 0;

    // ✅ Leads modified today (by employee)
    const leadsModifiedToday = await Lead.countDocuments({
      employee: emp._id,
      isDeleted: false,
      responseModifiedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ✅ Today's followups
    const todayFollowUps = await TodaysFollowUp.countDocuments({
      employee: emp._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // ✅ Running FT
    const todayISO = istNow.toISOString().slice(0, 10);
    const runningFT = await FTAssignment.countDocuments({
      raisedBy: userId,
      status: "Running",
      fromDate: { $lte: todayISO },
      toDate: { $gte: todayISO }
    });

    // ✅ User lead balance (how many leads assigned to user, by type)
    const userLeads = await Lead.find({ employee: emp._id, isDeleted: false });
    const userLeadBalance = {
      Premium: userLeads.filter(l => l.leadType === 'Premium').length,
      HNI: userLeads.filter(l => l.leadType === 'HNI').length,
      Web: userLeads.filter(l => l.leadType === 'Web').length,
      Fresh: userLeads.filter(l => l.leadType === 'Fresh').length,
      SEO: userLeads.filter(l => l.leadType === 'SEO').length,
    };

    // ✅ Pool leads balance (same as admin)
    const poolLeadsBalance = await Lead.aggregate([
      {
        $match: {
          employee: null,
          isDeleted: false,
          leadStatus: { $ne: "Deleted" }
        }
      },
      { $group: { _id: "$leadType", count: { $sum: 1 } } }
    ]);
    const formattedPoolBalance = {};
    poolLeadsBalance.forEach(lb => {
      formattedPoolBalance[lb._id] = lb.count;
    });

    // ✅ Send response
    res.status(200).json({
      totalTarget: emp.target || 0,
      achievedTarget,
      todaySales: todaysSales,
      todayFollowUps,
      runningFT,
      leadsModified: leadsModifiedToday,
      connectedCalls: 0,
      todayCalling: "00:00:00",
      monthlyCalling: "00:00:00",
      leadBalance: userLeadBalance,
      poolLeads: formattedPoolBalance,
    });

  } catch (err) {
    console.error("🔥 SBA Dashboard Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// controllers/dashboardController.js

// controllers/dashboardController.js
exports.getArmDashboard = async (req, res) => {
  try {
    const userId = req.user._id; 
    const arm = await EmployeeData.findOne({ user: userId });
    if (!arm) return res.status(404).json({ message: "ARM not found" });

    const armEmpId = arm._id;
    const team = await Team.findOne({ leader: arm.username });
    const teammateUsernames = team?.teammates || [];

    const teammatesEmp = await EmployeeData.find({ username: { $in: teammateUsernames } });
    const teammatesUserIds = teammatesEmp.map(e => e.user).filter(Boolean);
    const teamUserIds = [userId, ...teammatesUserIds];
    const teamEmployeeIds = [armEmpId, ...teammatesEmp.map(e => e._id)];

    // Date range IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const startOfDay = new Date(istNow.setHours(0,0,0,0) - istOffset);
    const endOfDay = new Date(startOfDay.getTime() + 24*60*60*1000 -1);
    const todayISO = istNow.toISOString().slice(0,10);

    // === Individual
    const [
      selfAchievedAgg,
      todaySalesAgg,
      todayFollowUps,
      runningFT,
      leadsModified
    ] = await Promise.all([
      Payment.aggregate([{ $match: { raisedBy: userId, status: "Approved" } }, { $group: { _id: null, total: { $sum: "$totalPaid" } } }]),
      Payment.aggregate([{ $match: { raisedBy: userId, status: "Approved", date: { $gte: startOfDay, $lte: endOfDay } } }, { $group: { _id: null, total: { $sum: "$totalPaid" } } }]),
      TodaysFollowUp.countDocuments({ employee: userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      FTAssignment.countDocuments({ raisedBy: userId, status: "Running", fromDate: { $lte: todayISO }, toDate: { $gte: todayISO } }),
      Lead.countDocuments({ employee: armEmpId, updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);
    const selfAchieved = selfAchievedAgg[0]?.total || 0;
    const todaySales = todaySalesAgg[0]?.total || 0;

    // === Team
    const [
      teamAchievedAgg,
      teamTodaySalesAgg,
      teamTodayFollowUps,
      teamRunningFT,
      teamLeadsModified
    ] = await Promise.all([
      Payment.aggregate([{ $match: { raisedBy: { $in: teamUserIds }, status: "Approved" } }, { $group: { _id: null, total: { $sum: "$totalPaid" } } }]),
      Payment.aggregate([{ $match: { raisedBy: { $in: teamUserIds }, status: "Approved", date: { $gte: startOfDay, $lte: endOfDay } } }, { $group: { _id: null, total: { $sum: "$totalPaid" } } }]),
      TodaysFollowUp.countDocuments({ employee: { $in: teamUserIds }, date: { $gte: startOfDay, $lte: endOfDay } }),
      FTAssignment.countDocuments({ raisedBy: { $in: teamUserIds }, status: "Running", fromDate: { $lte: todayISO }, toDate: { $gte: todayISO } }),
      Lead.countDocuments({ employee: { $in: teamEmployeeIds }, updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);
    const teamAchieved = teamAchievedAgg[0]?.total || 0;
    const teamTodaySales = teamTodaySalesAgg[0]?.total || 0;

    // === Lead balance
    const userLeads = await Lead.find({ employee: armEmpId, isDeleted: false });
    const userLeadBalance = {
      Premium: userLeads.filter(l => l.leadType === 'Premium').length,
      Fresh: userLeads.filter(l => l.leadType === 'Fresh').length,
      HNI: userLeads.filter(l => l.leadType === 'HNI').length,
      SEO: userLeads.filter(l => l.leadType === 'SEO').length,
      Web: userLeads.filter(l => l.leadType === 'Web').length,
    };

    const poolLeads = await Lead.aggregate([
      { $match: { employee: null, leadStatus: { $ne: "Deleted" }, isDeleted: false } },
      { $group: { _id: "$leadType", count: { $sum: 1 } } }
    ]);
    const poolLeadsBalance = {};
    poolLeads.forEach(p => { poolLeadsBalance[p._id] = p.count; });

    res.json({
      selfTarget: arm.target || 0,
      selfAchieved,
      todaySales,
      todayFollowUps,
      runningFT,
      leadsModified,

      teamTarget: team?.target || 0,
      teamAchieved,
      teamTodaySales,
      teamTodayFollowUps,
      teamRunningFT,
      teamLeadsModified,

      connectedCalls: 0,
      todayCalling: "00:00:00",
      monthlyCalling: "00:00:00",
      leadBalance: userLeadBalance,
      poolLeads: poolLeadsBalance
    });
  } catch (err) {
    console.error("🔥 ARM Dashboard Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};




// exports.getArmDashboard = async (req, res) => {
//   try {
//     const username = req.user.username;

//     const emp = await EmployeeData.findOne({ username });
//     if (!emp) return res.status(404).json({ message: "Employee not found" });

//     const userId = emp.user;  // 🟢 payments ke liye
//     if (!userId) return res.status(404).json({ message: "Linked user not found for employee" });

//     // 🟢 Date Range: IST
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     const now = new Date();
//     const istNow = new Date(now.getTime() + istOffset);
//     const istStart = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
//     const startOfDay = new Date(istStart.getTime() - istOffset);
//     const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

//     const todayISO = istNow.toISOString().slice(0, 10);

//     // 🟢 Payments
//     const totalAchieved = await Payment.aggregate([
//       { $match: { raisedBy: userId, status: "Approved" } },
//       { $group: { _id: null, total: { $sum: "$totalPaid" } } }
//     ]);

//     const todayAchieved = await Payment.aggregate([
//       {
//         $match: {
//           raisedBy: userId,
//           status: "Approved",
//           date: { $gte: startOfDay, $lte: endOfDay }
//         }
//       },
//       { $group: { _id: null, total: { $sum: "$totalPaid" } } }
//     ]);

//     const selfAchieved = totalAchieved[0]?.total || 0;
//     const todaySales = todayAchieved[0]?.total || 0;

//     // 🟢 Leads
//     const leads = await Lead.find({ employee: emp._id, isDeleted: false });

//     // 🟢 Leads Modified Today
//     const leadsModified = await Lead.countDocuments({
//       employee: userId,
//       updatedAt: { $gte: startOfDay, $lte: endOfDay }
//     });

//     // 🟢 Todays FollowUps
//     const todayFollowUps = await TodaysFollowUp.countDocuments({
//       employee: userId,
//       date: { $gte: startOfDay, $lte: endOfDay }
//     });

//     // 🟢 Running FT
//     const runningFT = await FTAssignment.countDocuments({
//       raisedBy: userId,
//       status: "Running",
//       fromDate: { $lte: todayISO },
//       toDate: { $gte: todayISO }
//     });

//     // 🟢 Lead Balance
//     const userLeadBalance = {
//       Premium: leads.filter(l => l.leadType === 'Premium').length,
//       Fresh: leads.filter(l => l.leadType === 'Fresh').length,
//       HNI: leads.filter(l => l.leadType === 'HNI').length,
//       SEO: leads.filter(l => l.leadType === 'SEO').length,
//       Web: leads.filter(l => l.leadType === 'Web').length,
//     };

//     // 🟢 Pool Leads
//     const poolLeads = await Lead.aggregate([
//       { $match: { employee: null, leadStatus: { $ne: "Deleted" } } },
//       { $group: { _id: "$leadType", count: { $sum: 1 } } }
//     ]);
//     const formattedPoolBalance = {};
//     poolLeads.forEach(lb => {
//       formattedPoolBalance[lb._id] = lb.count;
//     });

//     // ✅ Send response
//     res.status(200).json({
//       selfTarget: emp.target || 0,
//       selfAchieved,
//       todaySales,
//       todayFollowUps,
//       runningFT,
//       leadsModified,
//       // 🟢 Team fields zero (agar future me add karna ho to)
//       teamTarget: 0,
//       teamAchieved: 0,
//       teamTodaySales: 0,
//       teamTodayFollowUps: 0,
//       teamRunningFT: 0,
//       teamLeadsModified: 0,
//       leadBalance: userLeadBalance,
//       poolLeads: formattedPoolBalance,
//       connectedCalls: 0,
//       todayCalling: "00:00:00",
//       monthlyCalling: "00:00:00"
//     });

//   } catch (err) {
//     console.error("🔥 ARM Dashboard Error:", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };




// ------------------- TL DASHBOARD -------------------
// controllers/dashboardController.js

// controllers/dashboardController.js

exports.getTlDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const tl = await EmployeeData.findOne({ user: userId });
    if (!tl) return res.status(404).json({ message: "TL not found" });

    const team = await Team.findOne({ leader: tl.username });
    const teammateUsernames = team?.teammates || [];

    const teammatesEmp = await EmployeeData.find({ username: { $in: teammateUsernames } });
    const teammatesUserIds = teammatesEmp.map(e => e.user).filter(Boolean);
    const teamUserIds = [userId, ...teammatesUserIds];
    const teamEmployeeIds = [tl._id, ...teammatesEmp.map(e => e._id)];

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const startOfDay = new Date(istNow.setHours(0,0,0,0) - istOffset);
    const endOfDay = new Date(startOfDay.getTime() + 24*60*60*1000 -1);
    const todayISO = istNow.toISOString().slice(0,10);

    // === Individual
    const [
      selfAchieved,
      todaySales,
      todayFollowUps,
      runningFT,
      leadsModified
    ] = await Promise.all([
      Lead.countDocuments({ employee: tl._id, leadStatus: "Disposed" }),
      Lead.countDocuments({ employee: tl._id, leadStatus: "Disposed", updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
      TodaysFollowUp.countDocuments({ employee: userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      FTAssignment.countDocuments({ raisedBy: userId, status: "Running", fromDate: { $lte: todayISO }, toDate: { $gte: todayISO } }),
      Lead.countDocuments({ employee: tl._id, updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    // === Team
    const [
      teamAchieved,
      teamTodaySales,
      teamTodayFollowUps,
      teamRunningFT,
      teamLeadsModified
    ] = await Promise.all([
      Lead.countDocuments({ employee: { $in: teamEmployeeIds }, leadStatus: "Disposed" }),
      Lead.countDocuments({ employee: { $in: teamEmployeeIds }, leadStatus: "Disposed", updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
      TodaysFollowUp.countDocuments({ employee: { $in: teamUserIds }, date: { $gte: startOfDay, $lte: endOfDay } }),
      FTAssignment.countDocuments({ raisedBy: { $in: teamUserIds }, status: "Running", fromDate: { $lte: todayISO }, toDate: { $gte: todayISO } }),
      Lead.countDocuments({ employee: { $in: teamEmployeeIds }, updatedAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    const userLeads = await Lead.find({ employee: tl._id, isDeleted: false });
    const userLeadBalance = {
      Premium: userLeads.filter(l => l.leadType === 'Premium').length,
      Fresh: userLeads.filter(l => l.leadType === 'Fresh').length,
      HNI: userLeads.filter(l => l.leadType === 'HNI').length,
      SEO: userLeads.filter(l => l.leadType === 'SEO').length,
      Web: userLeads.filter(l => l.leadType === 'Web').length,
    };

    const poolLeads = await Lead.aggregate([
      { $match: { employee: null, leadStatus: { $ne: "Deleted" }, isDeleted: false } },
      { $group: { _id: "$leadType", count: { $sum: 1 } } }
    ]);
    const poolLeadsBalance = {};
    poolLeads.forEach(p => { poolLeadsBalance[p._id] = p.count; });

    res.json({
      selfTarget: tl.target || 0,
      selfAchieved,
      todaySales,
      todayFollowUps,
      runningFT,
      leadsModified,

      teamTarget: team?.target || 0,
      teamAchieved,
      teamTodaySales,
      teamTodayFollowUps,
      teamRunningFT,
      teamLeadsModified,

      connectedCalls: 0,
      todayCalling: "00:00:00",
      monthlyCalling: "00:00:00",
      leadBalance: userLeadBalance,
      poolLeads: poolLeadsBalance
    });
  } catch (err) {
    console.error("🔥 TL Dashboard Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
