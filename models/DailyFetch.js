const mongoose = require('mongoose');


const dailyFetchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leadSource: String,
  date: Date,
  count: { type: Number, default: 0 }
});
module.exports = mongoose.model('DailyFetch', dailyFetchSchema);
