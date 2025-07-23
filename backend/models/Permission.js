// models/Permission.js
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: String, required: true }, // ✅ add this
  status: { type: Boolean, default: true }
});

permissionSchema.index({ name: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);
