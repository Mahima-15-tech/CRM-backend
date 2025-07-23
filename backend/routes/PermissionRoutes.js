const express = require('express');
const mongoose = require('mongoose'); // ✅ Required for ObjectId validation
const router = express.Router();
const Permission = require('../models/Permission');
const ProfilePermission = require('../models/ProfilePermission');

// ✅ Bulk insert permissions
router.post('/bulk', async (req, res) => {
  try {
    const permissions = req.body.permissions;

    const result = await Permission.insertMany(permissions, { ordered: false });

    res.status(201).json({ message: 'Permissions inserted', data: result });
  } catch (err) {
    console.error("Insert error:", err);
    if (err.code === 11000 || err.writeErrors) {
      // Duplicate key — partial success likely
      res.status(207).json({
        message: 'Some permissions were already inserted before.',
        insertedCount: err.result?.insertedCount || 0,
        duplicateCount: err.writeErrors?.length || 0,
        error: err.message
      });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});


// ✅ Get all permission options
router.get('/permissions', async (req, res) => {
  const permissions = await Permission.find();
  res.json(permissions);
});

// ✅ Get permissions for a specific profile
router.get('/profile-permissions/:profileId', async (req, res) => {
  const { profileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ message: 'Invalid or missing profileId' });
  }

  try {
    const profilePermission = await ProfilePermission.findOne({ profileId });
    if (!profilePermission) {
      return res.status(404).json({ message: 'ProfilePermission not found' });
    }
    res.json(profilePermission.permissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.post('/profile-permissions/:profileId', async (req, res) => {
  const { permissions } = req.body;
  const profileId = req.params.profileId;

  try {
    let profilePermission = await ProfilePermission.findOne({ profileId });

    if (!profilePermission) {
      // Create new
      profilePermission = new ProfilePermission({ profileId, permissions });
    } else {
      // 🔁 Merge old + new
      const existingPermissions = profilePermission.permissions;

      const updatedPermissions = [...existingPermissions];

     permissions.forEach(newPerm => {
  const existingIndex = updatedPermissions.findIndex(
  p => p.name === newPerm.name && p.group === newPerm.group
);


  if (existingIndex !== -1) {
    updatedPermissions[existingIndex].status = newPerm.status;
    updatedPermissions[existingIndex].group = newPerm.group || ""; // ✅ update group too
  } else {
    updatedPermissions.push({
      name: newPerm.name,
      status: newPerm.status,
      group: newPerm.group || "" // ✅ ensure group is added when new
    });
  }
});


      profilePermission.permissions = updatedPermissions;
    }

    await profilePermission.save();
    res.json({ message: "Permissions merged successfully", data: profilePermission });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
