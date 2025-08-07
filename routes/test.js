// backend/routes/test.js
const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  res.send("🎉 Backend is Live and Working!");
});

module.exports = router;
