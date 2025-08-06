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

// Bulk upload scripts from CSV
router.post('/bulk', async (req, res) => {
  try {
    const scripts = req.body;

    if (!Array.isArray(scripts)) {
      return res.status(400).json({ error: "Invalid input format, expected array" });
    }

    // Optional: Clean or validate scripts here before inserting

    const insertedScripts = await Script.insertMany(scripts);
    res.status(201).json({ message: 'Scripts added successfully', data: insertedScripts });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
