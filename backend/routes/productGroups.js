// routes/productGroups.js
const express = require('express');
const router = express.Router();
const ProductGroup = require('../models/ProductGroup');

// Get all product groups
router.get('/', async (req, res) => {
  try {
    const groups = await ProductGroup.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const group = new ProductGroup(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const group = await ProductGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    await ProductGroup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
