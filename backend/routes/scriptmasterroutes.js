const express = require('express');
const router = express.Router();
const ScriptMaster = require('../models/ScriptMaster');

// GET all script master entries
router.get('/', async (req, res) => {
  try {
    const data = await ScriptMaster.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new script master entry
router.post('/', async (req, res) => {
  try {
    const newEntry = new ScriptMaster(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update script master entry
router.put('/:id', async (req, res) => {
  try {
    const updated = await ScriptMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a script master entry
router.delete('/:id', async (req, res) => {
  try {
    await ScriptMaster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
