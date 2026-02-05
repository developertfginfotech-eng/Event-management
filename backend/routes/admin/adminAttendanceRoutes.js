const express = require('express');
const {
  exportAttendanceToExcel,
  exportAttendanceToCSV,
} = require('../../controllers/admin/adminAttendanceController');

const router = express.Router();

const { protect, checkPermission } = require('../../middleware/auth');

// All admin attendance routes require authentication and canViewReports permission
router.use(protect);
router.use(checkPermission('canViewReports'));

// Export
router.get('/export/excel', exportAttendanceToExcel);
router.get('/export/csv', exportAttendanceToCSV);

module.exports = router;
