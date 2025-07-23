    const express = require('express');
    const router = express.Router();
    const Employee = require('../models/employee')



// Create
router.post('/', async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({ error: 'Name and Department are required' });
    }

    const newEmployee = new Employee({ name, department });
    const saved = await newEmployee.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

    // Read All
    router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // Update
    router.put('/:id', async (req, res) => {
    try {
        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
    });

    // Delete
    router.delete('/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
    });

    module.exports = router;
