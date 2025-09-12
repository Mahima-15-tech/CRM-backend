// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { getClientDashboard } = require('../controllers/clientcontroller');
const { authenticateUser} = require('../middleware/authMiddleware');

router.get('/me', authenticateUser, getClientDashboard);



module.exports = router;
