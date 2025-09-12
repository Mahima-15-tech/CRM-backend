// routes/productGroups.js
const express = require('express');
const router = express.Router();
const ProductGroup = require('../models/ProductGroup');
const Product = require("../models/Product");

// Get all product groups

router.get('/', async (req, res) => {
  try {
    const groups = await ProductGroup.find(); // already has name + products array
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, products } = req.body; // products = array of product IDs

    // IDs se names fetch karna
    const productDocs = await Product.find({ _id: { $in: products } });
    const productNames = productDocs.map((p) => p.productName);

    // Group save with names
    const newGroup = new ProductGroup({
      name,
      products: productNames, // names save
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
