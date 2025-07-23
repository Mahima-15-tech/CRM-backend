const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  leader: { type: String, required: true }, // username of leader
  leaderProfile: { type: String, required: true },
  teammates: [String], // usernames
  teammateProfiles: [String] // profiles used for grouping
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
