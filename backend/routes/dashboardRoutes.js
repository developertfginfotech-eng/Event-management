const express = require('express');
const {
  getAdminDashboard,
  getUserDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.route('/admin').get(checkPermission('canViewReports'), getAdminDashboard);

router.route('/user').get(getUserDashboard);

module.exports = router;
