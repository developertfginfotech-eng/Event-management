const express = require('express');
const {
  exportAttendanceToExcel,
  exportAttendanceToCSV,
  exportAttendanceToPDF,
} = require('../../controllers/admin/adminAttendanceController');

const router = express.Router();

const { protect, checkPermission } = require('../../middleware/auth');

// All admin attendance routes require authentication and canViewReports permission
router.use(protect);
router.use(checkPermission('canViewReports'));

// Export
router.get('/export/excel', exportAttendanceToExcel);
router.get('/export/csv', exportAttendanceToCSV);
router.get('/export/pdf', exportAttendanceToPDF);

module.exports = router;
