const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add service
router.post("/", async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.json(newService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
