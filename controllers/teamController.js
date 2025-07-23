const Team = require('../models/Team');

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();

    // Format teammates by profile
    const formatted = teams.map(team => {
      const teammatesByProfile = {};

      for (let i = 0; i < team.teammateProfiles.length; i++) {
        const profile = team.teammateProfiles[i];
        teammatesByProfile[profile] = team.teammates.filter((_, index) => {
          return Math.floor(index / (team.teammates.length / team.teammateProfiles.length)) === i;
        });
      }

      return {
        ...team._doc,
        teammatesByProfile
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a team
exports.createTeam = async (req, res) => {
  try {
    const { title, leader, leaderProfile, teammates, teammateProfiles } = req.body;
    const newTeam = new Team({ title, leader, leaderProfile, teammates, teammateProfiles });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Team.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await Team.findByIdAndDelete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
