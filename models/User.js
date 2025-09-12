const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // login ke liye
  email: { type: String, required: false, unique: true }, // ✅ email ab unique hoga
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'client'], default: 'user' },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  status: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  kycStatus: {
    type: String,
    enum: ["Pending", "Complete"],
    default: "Pending",
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
