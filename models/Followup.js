const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  note: { type: String },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Followup', followupSchema);
