const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Pending counts
    const pendingPaymentsCount = await Payment.countDocuments({ status: "Pending" });
    const pendingInvoicesCount = await Invoice.countDocuments({ status: "Pending" });

    // Sales (today + month)
   // Sales (today + month)
const todaySalesAgg = await Payment.aggregate([
  { $match: { status: "Approved", date: { $gte: startOfDay, $lte: endOfDay } } },
  { $group: { _id: null, totalPaid: { $sum: "$totalPaid" } } }
]);
const todaySalesAmount = todaySalesAgg[0]?.totalPaid || 0;

const monthSalesAgg = await Payment.aggregate([
  { $match: { status: "Approved", date: { $gte: startOfMonth, $lte: endOfDay } } },
  { $group: { _id: null, totalPaid: { $sum: "$totalPaid" } } }
]);
const monthlySalesAmount = monthSalesAgg[0]?.totalPaid || 0;

// Transactions (today)
const todayTransactions = await Payment.aggregate([
  { $match: { status: "Approved", date: { $gte: startOfDay, $lte: endOfDay } } },
  {
    $group: {
      _id: "$paymentMode",
      totalPayments: { $sum: 1 },
      totalAmount: { $sum: "$totalPaid" }
    }
  }
]);

// Transactions (month)
const monthlyTransactions = await Payment.aggregate([
  { $match: { status: "Approved", date: { $gte: startOfMonth, $lte: endOfDay } } },
  {
    $group: {
      _id: "$paymentMode",
      totalPayments: { $sum: 1 },
      totalAmount: { $sum: "$totalPaid" }
    }
  }
]);

// Monthly sales graph (last 6 months)
// Monthly sales graph (last 6 months)
const monthlyGraphData = await Payment.aggregate([
  { $match: { status: "Approved" } },
  {
    $group: {
      _id: { month: { $month: "$date" }, year: { $year: "$date" } },
      totalPaid: { $sum: "$totalPaid" }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } },
  { $limit: 6 }
]);

// month names array
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

res.json({
  pendingPaymentsCount,
  pendingInvoicesCount,
  todaySalesAmount,
  monthlySalesAmount,
  todayTransactions: todayTransactions.map(t => ({
    paymentMode: t._id,
    totalPayments: t.totalPayments,
    totalAmount: t.totalAmount
  })),
  monthlyTransactions: monthlyTransactions.map(t => ({
    paymentMode: t._id,
    totalPayments: t.totalPayments,
    totalAmount: t.totalAmount
  })),
  monthlyGraphData: monthlyGraphData.map(d => ({
    month: `${monthNames[d._id.month - 1]} ${d._id.year}`,  // 👈 eg: "Sep 2025"
    totalPaid: d.totalPaid
  }))
});

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
