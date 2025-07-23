const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Add category
router.post('/', async (req, res) => {
  const { categoryName, description } = req.body;
  const newCategory = new Category({ categoryName, description });
  await newCategory.save();
  res.status(201).json(newCategory);
});

// Update category
router.put('/:id', async (req, res) => {
  const { categoryName, description } = req.body;
  const updated = await Category.findByIdAndUpdate(req.params.id, { categoryName, description }, { new: true });
  res.json(updated);
});

// Delete category
router.delete('/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
