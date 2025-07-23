const express = require('express');
const router = express.Router();
const Company = require('../models/CompanyDetails');

// Get Company Data
router.get('/company', async (req, res) => {
  const data = await Company.findOne(); // assuming only 1 record
  res.json(data);
});

// Save/Update Company Data
router.post('/company', async (req, res) => {
  const existing = await Company.findOne();
  if (existing) {
    await Company.updateOne({}, req.body);
  } else {
    await Company.create(req.body);
  }
  res.json({ success: true });
});

module.exports = router;
