const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getActivityStats,
  cleanupOldLogs
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin access
router.use(protect);
router.use(authorize('Admin', 'Super Admin'));

// Routes
router.get('/', getActivityLogs);
router.get('/stats', getActivityStats);
router.delete('/cleanup', authorize('Super Admin'), cleanupOldLogs);

module.exports = router;
