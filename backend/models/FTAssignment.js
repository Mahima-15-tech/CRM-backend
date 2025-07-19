const mongoose = require('mongoose');

const ftAssignmentSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  leadSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadSource' }, // ✅ new field
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Running'], default: 'Pending' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FTAssignment', ftAssignmentSchema);
