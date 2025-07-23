// models/ProductGroup.js
const mongoose = require('mongoose');

const ProductGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: { type: [String], default: [] },  // ✅ Ensures products is always an array
});

module.exports = mongoose.model('ProductGroup', ProductGroupSchema);
