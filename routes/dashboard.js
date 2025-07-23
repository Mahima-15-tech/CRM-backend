const express = require('express');
const router = express.Router();
const { getAdminDashboard, getSbaDashboard, getArmDashboard, getTlDashboard  } = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/authMiddleware');


router.get('/admin',authenticateUser, getAdminDashboard);
router.get('/sba',authenticateUser, getSbaDashboard);
router.get('/arm', authenticateUser, getArmDashboard);
router.get('/tl', authenticateUser, getTlDashboard);

module.exports = router;
