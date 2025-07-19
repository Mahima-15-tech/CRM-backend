// routes/reportroutes.js
const express = require("express");
const router = express.Router();
const { getWorkReport } = require("../controllers/reportController");

router.get("/admin/work-report", getWorkReport);

module.exports = router;
