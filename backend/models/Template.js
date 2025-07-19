const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  mailFrom: String,
  attachment: String,
  template: String
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
