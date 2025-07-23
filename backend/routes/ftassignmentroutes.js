const express = require('express');
const router = express.Router();
const controller = require('../controllers/ftassignmentcontroller');
const { authenticateUser } = require('../middleware/authMiddleware');

// ✅ Specific routes first
router.get('/admin/pending', authenticateUser, controller.getPendingFTApprovals);
router.post('/admin/bulk-update', authenticateUser, controller.bulkUpdateFTStatus);
router.get('/admin/all', controller.getAllFTAssignments);
router.get('/user/:userId',  controller.getUserFTAssignments);

// ✅ Generic (after all others)
router.get('/:leadId', authenticateUser, controller.getFTByLeadId);
router.post('/', authenticateUser, controller.assignFT);

module.exports = router;
