const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // ✅ changed from email to username
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  status: { type: Boolean, default: true }, // true = active, false = inactive

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
