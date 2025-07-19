const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String },
  clientLimit: { type: Number, default: 0 },
  invoiceLimit: { type: Number, default: 0 },
  salesLimit: { type: Number, default: 0 },
  hide: { type: Boolean, default: false }
});

module.exports = mongoose.model('Profile', profileSchema);
