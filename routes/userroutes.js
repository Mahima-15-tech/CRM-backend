const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmployeeData = require('../models/employeedata');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // ✅ Check if it's a valid ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid User ID format' });
    }

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user by ID:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ PUT /api/users/user/status/:employeeId
router.put('/user/status/:employeeId', async (req, res) => {
  try {
    const { status } = req.body;

    // Step 1: Find the employee by ID
    const employee = await EmployeeData.findById(req.params.employeeId);
    if (!employee || !employee.user) {
      return res.status(404).json({ message: "Employee or linked user not found" });
    }

    // Step 2: Update the user status
    await User.findByIdAndUpdate(employee.user, { status });

    res.json({ message: "User status updated successfully" });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ message: "Error updating user status" });
  }
});


router.put('/change-password', authMiddleware.authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
