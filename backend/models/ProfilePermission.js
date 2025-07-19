const mongoose = require('mongoose');

const profilePermissionSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  permissions: [
    {
      name: String,
      status: Boolean,
      group: String // ✅ Add this line
    }
  ]
});

module.exports = mongoose.model('ProfilePermission', profilePermissionSchema);
