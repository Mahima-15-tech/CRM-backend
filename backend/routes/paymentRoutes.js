const express = require("express");
const router = express.Router();
const PaymentMode = require("../models/paymentMode");

// Create
router.post("/", async (req, res) => {
  try {
    const data = new PaymentMode(req.body);
    await data.save();
    res.status(201).send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read all
router.get("/", async (req, res) => {
  const data = await PaymentMode.find().sort({ createdAt: -1 });
  res.send(data);
});

// Update
router.put("/:id", async (req, res) => {
  const updated = await PaymentMode.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(updated);
});

// Delete
router.delete("/:id", async (req, res) => {
  await PaymentMode.findByIdAndDelete(req.params.id);
  res.send({ message: "Deleted successfully" });
});

module.exports = router;
