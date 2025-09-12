const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/send-whatsapp", async (req, res) => {
  try {
    const { numbers, message } = req.body;

    const token = "YOUR_PERMANENT_ACCESS_TOKEN";
    const phoneNumberId = "YOUR_PHONE_NUMBER_ID";

    for (const num of numbers) {
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: num,
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    

    res.json({ success: true, msg: "Messages sent ✅" });
  } catch (err) {
    console.error("WhatsApp API error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Failed to send messages" });
  }
});


module.exports = router;
