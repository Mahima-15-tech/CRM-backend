// routes/LeadSourceRoutes.js

const express = require('express');
const router = express.Router();
const LeadSource = require('../models/LeadSource');

router.get('/', async (req, res) => {
  const sources = await LeadSource.find().populate('addedBy', 'name');
  res.json(sources);
});

router.post('/', async (req, res) => {
  const newData = new LeadSource(req.body);
  await newData.save();
  res.json({ message: 'Added successfully' });
});

router.put('/:id', async (req, res) => {
  await LeadSource.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated successfully' });
});

router.delete('/:id', async (req, res) => {
  await LeadSource.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
