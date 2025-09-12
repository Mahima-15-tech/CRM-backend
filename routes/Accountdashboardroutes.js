const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/Accountdashboard");
const { ACCOUNT_ID } = require("../constants/profiles");

// custom middleware
const isAdminOrAccounts = (req, res, next) => {
  if (
    req.user?.role?.toLowerCase() === "admin" ||
    String(req.user?.profileId) === ACCOUNT_ID
  ) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admin/Accounts only" });
};

// ✅ ab dono access kar sakte hain
router.get("/stats", authenticateUser, isAdminOrAccounts, getDashboardStats);

module.exports = router;
