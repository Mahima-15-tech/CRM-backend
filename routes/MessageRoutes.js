const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/messages/:id/rational", upload.single("file"), async (req, res) => {
  try {
    const { description } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const fileData = {
      url: `/uploads/${req.file.filename}`,
      description,
    };

    message.rationalFiles.push(fileData);
    await message.save();

    res.json(fileData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/message", async (req, res) => {
  try {
    let totalQuantity = 0;
    let quantity = 0; // ✅ sirf Stock Cash ke liye use hoga

    const lotSize = parseInt(req.body.lotSize) || 1;
    const lots = parseInt(req.body.lots) || 1;
    const shares = parseInt(req.body.shares) || 0;
    const subCategory = req.body.subCategory || "";

    if (subCategory === "Stock Cash") {
      totalQuantity = shares;  
      quantity = shares;       // ✅ Stock Cash me quantity bhi set
    } else {
      totalQuantity = lotSize * lots;
      quantity = 0;            // ✅ Futures/Options me quantity empty
    }

    const newMsg = new Message({
      ...req.body,
      lotSize,
      lots,
      totalQuantity,
      quantity,   // ✅ ab DB me alag se store hoga
      status: "open"
    });

    await newMsg.save();
    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// get all messages
router.get("/messagedata", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// router.post("/message", async (req, res) => {
//   try {
//     const { lotSize = 1, lots = 1 } = req.body;
//     const totalQuantity = lotSize * lots;

    
//     const newMsg = new Message({ 
//       ...req.body, 
//       lotSize, 
//       lots,
//       totalQuantity,
//       status: "open" 
//     });
//     await newMsg.save();
//     res.json(newMsg);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });




// Get closed messages only
router.get("/messages", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) filter.status = status; // ✅ new filter

    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// POST update for a message (without closing)
router.post("/messages/:id/update", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, status, closedPrice } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const newUpdate = {
      text,
      status,
      closedPrice: closedPrice || null,
      date: new Date().toLocaleString()
    };

    message.updates.push(newUpdate);
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT close message (final calculation route)

// PUT close message (final calculation)
router.put("/messages/:id/close", async (req, res) => {
  try {
    const { closePrice, text } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    const entryPrice = msg.entryPrice || 0;

    // ✅ Stock Cash me sirf shares (totalQuantity direct use hoga)
    // ✅ Baaki sab me lotSize * lots
    const totalQuantity =
      msg.subCategory === "Stock Cash"
        ? msg.totalQuantity || 0
        : (msg.lotSize || 1) * (msg.lots || 1);

    let points = 0;
    if (msg.type?.toLowerCase() === "buy") points = entryPrice - closePrice;
    if (msg.type?.toLowerCase() === "sell") points = entryPrice - closePrice;

    const profitLoss = points * totalQuantity;

    msg.closePrice = closePrice;
    msg.points = points;
    msg.profitLoss = profitLoss;
    msg.totalQuantity = totalQuantity;
    msg.closedOn = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    msg.status = "closed";

    msg.updates.push({
      text: text || `Closed at ${closePrice}`,
      status: "close",
      closedPrice: closePrice,
      date: new Date().toLocaleString(),
    });

    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to close message" });
  }
});

module.exports = router;
