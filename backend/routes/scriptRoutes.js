const express = require('express');
const router = express.Router();
const Script = require('../models/Script');

// Get all scripts
router.get('/', async (req, res) => {
  const scripts = await Script.find();
  res.json(scripts);
});

// Add new script
router.post('/', async (req, res) => {
  const script = new Script(req.body);
  await script.save();
  res.status(201).json(script);
});

// Update script
router.put('/:id', async (req, res) => {
  const script = await Script.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(script);
});

// Delete script
router.delete('/:id', async (req, res) => {
  await Script.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
