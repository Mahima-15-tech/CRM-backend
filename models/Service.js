const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  plan: String,
  price: Number,
  gst: Number,
  finalPrice: Number,
  features: [String],
  cta: { type: String, default: "Get Started" } // 👈 yeh add karo
});

const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  overview: String,
  points: [String],
  pricing: [PricingSchema]
});

module.exports = mongoose.model("Service", ServiceSchema);
