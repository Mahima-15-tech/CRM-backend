const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Paymentuser');
const Followup = require('../models/Followup');
// const Lead = require('../models/Lead'); // already existing logic used

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 🎯 Achieved Target (sum of 'closed' leads)
    const achieved = await Lead.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          status: 'closed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" } // assuming amount field in leads
        }
      }
    ]);
    const achievedTarget = achieved[0]?.total || 0;

    // 💸 Today's Payment
    const payment = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" } // assuming amount field in payments
        }
      }
    ]);
    const todaysPayment = payment[0]?.total || 0;

    // 📞 Today's Follow-ups
    const todaysFollowups = await Followup.countDocuments({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // 🛠 Leads Modified Today
    const leadsModified = await Lead.countDocuments({
      userId,
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    // 📤 Response
    res.json({
      achievedTarget,
      todaysPayment,
      todaysFollowups,
      leadsModified
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
});

module.exports = router;
