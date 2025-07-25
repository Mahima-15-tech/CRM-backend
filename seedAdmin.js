// seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // for .env file

const User = require('./models/User'); // path adjust if needed

// ✅ MONGODB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    seedAdmin();
  })
  .catch((err) => console.error('❌ MongoDB connect error:', err));

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = 'admin';
    const name = 'Admin';

    // 🔁 Check if already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('⚠️ Admin user already exists');
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ❗IMPORTANT: Replace with actual Admin profileId from your DB
    const adminProfileId = '6842c8659b2014211cff9033';

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      role: 'admin',
      profileId: adminProfileId,
    });

    await newUser.save();
    console.log('✅ Admin user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}
