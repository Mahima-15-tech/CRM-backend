// backend/models/leadresponse.js

const mongoose = require('mongoose');

const leadResponseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  leadLimit: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('LeadResponse', leadResponseSchema);
