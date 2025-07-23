// models/LeadSource.js

const mongoose = require('mongoose');

const leadSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, {
  timestamps: true
});

module.exports = mongoose.model('LeadSource', leadSourceSchema);
