// backend/routes/leadResponseRoutes.js

const express = require('express');
const router = express.Router();
const LeadResponse = require('../models/leadresponses');

// ➕ GET All Lead Responses
router.get('/', async (req, res) => {
  try {
    const data = await LeadResponse.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// ➕ POST New Lead Response
router.post('/', async (req, res) => {
  try {
    const newItem = new LeadResponse(req.body);
    await newItem.save();
    res.json({ message: 'Lead response added successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error adding lead response', error });
  }
});

// ✏️ PUT Update Lead Response
router.put('/:id', async (req, res) => {
  try {
    await LeadResponse.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Lead response updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating lead response', error });
  }
});

// ❌ DELETE Lead Response
router.delete('/:id', async (req, res) => {
  try {
    await LeadResponse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead response deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting lead response', error });
  }
});

module.exports = router;
