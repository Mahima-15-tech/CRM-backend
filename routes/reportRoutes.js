// routes/reportroutes.js
const express = require("express");
const router = express.Router();
const { getWorkReport } = require("../controllers/reportController");

router.get('/admin/work-report', (req, res, next) => {
  console.log("🟩 route hit /admin/work-report");
  next();
}, getWorkReport);


module.exports = router;
