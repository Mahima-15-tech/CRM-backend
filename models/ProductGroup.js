const mongoose = require('mongoose');

const ProductGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: { type: [String], default: [] },  // <-- ab yahan product names ayenge
});

module.exports = mongoose.model('ProductGroup', ProductGroupSchema);
