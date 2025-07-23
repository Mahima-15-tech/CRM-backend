const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// GET all templates
router.get('/', async (req, res) => {
  const templates = await Template.find();
  res.json(templates);
});

// POST new template
router.post('/', async (req, res) => {
  const { type, title, content, mailFrom, attachment, template } = req.body;
  const newTemplate = new Template({ type, title, content, mailFrom, attachment, template });
  await newTemplate.save();
  res.status(201).json(newTemplate);
});

// PUT: Update a template
router.put('/:id', async (req, res) => {
  try {
    const updated = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update template' });
  }
});

// DELETE: Delete a template
router.delete('/:id', async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete template' });
  }
});


module.exports = router;
