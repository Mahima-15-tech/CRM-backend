// controllers/adminController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.impersonateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

    const targetUser = await User.findById(req.body.targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const newToken = jwt.sign(
      { userId: targetUser._id, role: targetUser.role, profileId: targetUser.profileId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ user: targetUser, token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
