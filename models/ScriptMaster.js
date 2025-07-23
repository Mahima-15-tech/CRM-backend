const mongoose = require('mongoose');

const scriptMasterSchema = new mongoose.Schema({
  subcategory: { type: String, required: true },
  lot: { type: Boolean, default: false },
  scripts: [{ type: String }] // These are names of scripts selected
});

module.exports = mongoose.model('ScriptMaster', scriptMasterSchema);
