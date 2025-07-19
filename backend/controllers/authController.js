const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Permission = require ('../models/Permission')
const EmployeeData =  require('../models/employeedata')


exports.registerUser = async (req, res) => {
  try {
    const { name, username, password, role, profileId } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminProfileId = '6842c8659b2014211cff9033'; // replace this with real Admin profileId

    // ✅ Auto-assign Admin profileId if not provided
    const finalProfileId =
      role === 'admin' ? profileId || adminProfileId : profileId;

    const user = new User({
      name,
      username,
      password: hashedPassword,
      role,
      profileId: finalProfileId,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'Invalid username or password' });

    if (user.status === false) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      {
       userId: user._id,
        username: user.username,
        profileId: user.profileId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Fetch employee to get photo
    const EmployeeData = require('../models/employeedata');
    const employee = await EmployeeData.findOne({ user: user._id });

    const permissions = await Permission.find({ profileId: user.profileId, status: true });

    res.json({
      token,
      user: {
        id: user._id, // keep as is
        _id: user._id, 
        name: user.name,
        role: user.role,
        profileId: user.profileId,
        permissions,
        photo: employee?.photo || null, // ✅ now safe
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: err.message });
  }
};
