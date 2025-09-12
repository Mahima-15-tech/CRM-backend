const mongoose = require("mongoose");

const UpdateSchema = new mongoose.Schema({
  text: String,
  date: String,
  status: String,
  closedPrice: Number,
});

const MessageSchema = new mongoose.Schema({
  text: String,
  productName: String,
  scriptName: String,
  user: String,
  date: String,
  dateOnly: String,
  type: { type: String }, // BUY / SELL
  shares: Number,          // ✅ Stock Cash ke liye (nayi field)
  quantity: Number,
  lotSize: Number,
  lots: Number,
  totalQuantity: Number,
  entryPrice: Number,
  subCategory: String, // e.g. Stock Cash, Stock Future, Stock Option

  closePrice: Number,
  closedOn: String,
  points: Number,
  profitLoss: Number,
  status: { type: String, enum: ["open", "closed"], default: "open" },
  updates: [UpdateSchema],
  rationalFiles: [
    {
      url: String,
      description: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
