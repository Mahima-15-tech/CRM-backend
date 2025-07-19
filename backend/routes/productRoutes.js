const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const all = await Product.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all FT products
router.get('/ft-products', async (req, res) => {
  try {
    const ftProducts = await Product.find({ ft: true });
    res.json(ftProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST create product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ message: err.message });
  }
});


// PUT update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
