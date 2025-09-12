// routes/otpAuth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');

let transporter;
try {
  transporter = require('../config/email'); // email transporter
} catch (e) {
  transporter = null;
}

const router = express.Router();

/**
 * @route   POST /forgot-password
 * @desc    Generate OTP and send to email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTPs for this email
    await OTP.deleteMany({ email });

    // Save OTP with 10-minute expiry
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send OTP via email
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Support" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Password Reset OTP',
          html: `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 10 minutes.</p>`
        });
      } catch (mailErr) {
        console.error('❌ Email send failed:', mailErr.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      }
    } else {
      console.log(`⚠️ OTP for ${email}: ${otp} (email transporter not configured)`);
    }

    return res.status(200).json({ success: true, message: 'OTP sent successfully. Check your email.' });

  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /reset-password
 * @desc    Verify OTP and reset password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Update user password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Cleanup OTP
    await OTP.deleteMany({ email });

    return res.status(200).json({ success: true, message: 'Password reset successful' });

  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
