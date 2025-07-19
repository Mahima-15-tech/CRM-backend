const express = require('express');
const router = express.Router();

const { impersonateUser } = require("../controllers/adminController");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post('/api/admin/impersonate', authenticateUser, impersonateUser);

module.exports = router;
