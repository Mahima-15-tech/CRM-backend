const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  title: String,
  duration: String,
  type: { type: String, enum: ['Days', 'Calls'], default: 'Days' },
  price: Number,
});

const productSchema = new mongoose.Schema({
  category: String,
  productName: String,
  riskAbove: Number,
  telegram: String,
  description: String,
  pricing: [pricingSchema],
  ft: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
