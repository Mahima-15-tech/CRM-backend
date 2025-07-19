const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lotSize: { type: Number, required: true },
  types: [{ type: String }] // e.g., ["Stock Cash", "Stock Future"]
});

module.exports = mongoose.model('Script', scriptSchema);
