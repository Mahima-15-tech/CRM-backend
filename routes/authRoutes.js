const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const authController = require("../controllers/authController");

// authRoutes.js
router.post('/signup', registerUser);  // ✅ match frontend
router.post('/login', loginUser);



module.exports = router;
