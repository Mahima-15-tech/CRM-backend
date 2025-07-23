const mongoose = require('mongoose');

const fetchLimitSchema = new mongoose.Schema({
  fetchLimit: { type: Number, required: true },
  fetchCount: { type: Number, required: true },
  availableLimit: { type: Number, required: true }, // ✅
  duration: { type: Number, required: true },
  leadSource: { type: String, required: true },
  selectedProfiles: [String],
  selectedEmployees: {
    type: Map,
    of: [String]
  }
}, { timestamps: true });
module.exports = mongoose.model('FetchLimit', fetchLimitSchema);

