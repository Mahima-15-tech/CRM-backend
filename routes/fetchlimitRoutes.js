const express = require('express');
const router = express.Router();
const FetchLimit = require('../models/FetchLimit');

// Create
router.post('/', async (req, res) => {
  try {
    const newLimit = new FetchLimit(req.body);
    await newLimit.save();
    res.status(201).json(newLimit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read All
router.get('/', async (req, res) => {
  try {
    const limits = await FetchLimit.find().sort({ createdAt: -1 });
    res.json(limits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await FetchLimit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await FetchLimit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
