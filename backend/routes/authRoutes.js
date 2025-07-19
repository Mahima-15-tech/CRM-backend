const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser); // for admin to register users
router.post('/login', loginUser); // for login

module.exports = router;
