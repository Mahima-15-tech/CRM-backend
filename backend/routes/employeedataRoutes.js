const express = require('express');
const router = express.Router();
const EmployeeData = require('../models/employeedata');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

/* -------------------- Create Employee + User -------------------- */
router.post('/employeedata', upload.single('photo'), async (req, res) => {
  console.log('➡️ File received:', req.file);
  console.log('➡️ Body received:', req.body);

  try {
    const employeeData = req.body;

    // ✅ Ensure leadPermission is an array
    if (typeof employeeData.leadPermission === 'string') {
      employeeData.leadPermission = [employeeData.leadPermission];
    }

    // ✅ Attach photo if uploaded
    if (req.file) {
      employeeData.photo = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    // 1. Validation
    if (!employeeData.username || !employeeData.password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // 2. Check if username already exists
    const userExists = await User.findOne({ username: employeeData.username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // 4. Create login user
    const user = new User({
      name: employeeData.name,
      username: employeeData.username,
      password: hashedPassword,
      role: 'user',
      profileId: req.body.profile,
    });

    employeeData.profile = req.body.profile;
    await user.save();

    // 5. Save employee data
    delete employeeData.password;
    employeeData.user = user._id;

    const employee = new EmployeeData(employeeData);
    await employee.save();

    res.status(201).json({ message: 'Employee and user created successfully' });
  } catch (err) {
    console.error('Add Employee Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------- Get All Employees ------------------- */
/* ------------------- Get All Employees ------------------- */
router.get('/employeedata', async (req, res) => {
  try {
    const employees = await EmployeeData.find()
      .populate("user", "name")
      .populate("profile", "name") // ✅ add this
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});






/* ------------------ Get Single Employee ------------------ */
router.put('/employeedata/:id', upload.single('photo'), async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.photo = `http://localhost:5000/uploads/${req.file.filename}`;
    }

   if (req.body.permissions) {
  data.permissions = req.body.permissions.map(p => {
    try {
      return JSON.parse(p);
    } catch (err) {
      console.error("❌ Permission parse error:", err, p);
      return null;
    }
  }).filter(Boolean); // remove nulls
}

console.log("🧩 Permissions received:", data.permissions);


    if (data.username) {
      const user = await User.findOne({ username: data.username });
      if (user) {
        data.user = user._id;
      }
    }

    const updated = await EmployeeData.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// routes/employeedataRoutes.js
router.get("/employeedata/profiles/:profileId", async (req, res) => {
  try {
    const employees = await EmployeeData.find({ profile: req.params.profileId }).populate("user", "name")
    .populate("profile", "name"); 
    res.json(employees);
    
  } catch (err) {
    res.status(500).json({ error: "Error fetching employees" });
  }
});


/* ------------------ Delete Employee ------------------ */
router.delete('/employeedata/:id', async (req, res) => {
  try {
    await EmployeeData.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

// ✅ Minimal list for dropdowns (Searchable)
router.get("/employeedata/dropdown", async (req, res) => {
  try {
    const employees = await EmployeeData.find()
      .populate("user", "username name _id") // ✅ make sure _id is included
      .populate("profile", "name");

    const dropdownList = employees.map(emp => ({
      _id: emp.user?._id, // ✅ return USER ID, not employee id
      name: emp.user?.name || "",
      username: emp.user?.username || "",
      profile: emp.profile?.name || "",
    }));

    res.json(dropdownList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee dropdown data" });
  }
});

router.get('/employeedata/user/:userId', async (req, res) => {
  try {
    const employee = await EmployeeData.findOne({ user: req.params.userId })
      .populate('profile', 'name')
      .populate('user', 'name username');

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee by user", error: err.message });
  }
});


router.get('/employeedata/lead-permissions/:userId', async (req, res) => {
  try {
    const employee = await EmployeeData.findOne({ user: req.params.userId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json(employee.leadPermission || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lead permissions" });
  }
});

// ✅ Add this GET route
router.get('/employeedata/:id', async (req, res) => {
  try {
    const emp = await EmployeeData.findById(req.params.id)
      .populate('profile', 'name _id')     // get profile name + id
      .populate('user', 'username name');  // get username + name

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // include password (optional): only if required for prefill
    const user = await User.findById(emp.user);
    const fullData = {
      ...emp.toObject(),
      username: user?.username,
      password: '',
      permissions: emp.permissions || [],
 // ⚠️ don't send hashed password
    };

    res.json(fullData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee", error: err.message });
  }
});


module.exports = router;
