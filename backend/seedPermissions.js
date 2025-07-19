const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Permission = require('./models/Permission'); // Path may differ

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected for seeding");
  seedPermissions();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Seed data
const permissions = [
  "Client Add",
  "Client View",
  "Client Edit",
  "Invoice Create",
  "Invoice View",
  "Invoice Delete",
  "Sales Add",
  "Sales View",
  "Sales Delete",
  "User Create",
  "User Delete",
  "Report Download",``
].map(name => ({ name }));

// Insert permissions
async function seedPermissions() {
  try {
    await Permission.deleteMany(); // Optional: Clears old data
    await Permission.insertMany(permissions);
    console.log("✅ Permissions seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    mongoose.connection.close();
  }
}
