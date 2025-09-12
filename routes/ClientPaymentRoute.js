const express = require("express");
const router = express.Router();
const ClientPayment = require("../models/ClientPayment");
const { authenticateUser, isAuth, isAdmin } = require("../middleware/authMiddleware");

// 1. User requests payment (after "I Have Paid")
router.post("/request",authenticateUser, isAuth, async (req, res) => {
  try {
    const { serviceId, plan, amount } = req.body;

    const payment = await ClientPayment.create({
      user: req.user._id,
      service: serviceId,
      plan,
      amount,
    });

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Payment request error:", err);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// 2. Admin approves/rejects payment
router.put("/:id/status",authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await ClientPayment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// 3. User gets his payment status
router.get("/my-payments",authenticateUser, isAuth, async (req, res) => {
  const payments = await ClientPayment.find({ user: req.user._id })
    .populate("service", "title")
    .sort({ createdAt: -1 });

  res.json(payments);
});

// 4. Admin gets all pending payments
router.get("/all",authenticateUser, isAdmin, async (req, res) => {
  const payments = await ClientPayment.find()
    .populate("user", "name email")
    .populate("service", "title")
    .sort({ createdAt: -1 });

  res.json(payments);
});

// routes/payments.js
router.get("/mysubscription", authenticateUser, async (req, res) => {
  const payment = await ClientPayment.findOne({
    user: req.user._id,
    status: "approved"
  }).populate("service");

  if (!payment) {
    return res.json({ subscribed: false });
  }

  res.json({ subscribed: true, service: payment.service, plan: payment.plan });
});


module.exports = router;
