const express = require('express');
const {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  exportAttendanceToExcel,
  exportAttendanceToCSV,
  exportAttendanceToPDF,
} = require('../../controllers/admin/adminAttendanceController');

const router = express.Router();

const { protect, checkPermission } = require('../../middleware/auth');

// All admin attendance routes require authentication
router.use(protect);

// CRUD routes (require admin/manage permissions)
router.post('/', checkPermission('canManageAttendance'), createAttendance);
router.put('/:id', checkPermission('canManageAttendance'), updateAttendance);
router.delete('/:id', checkPermission('canManageAttendance'), deleteAttendance);

// Export routes (require view reports permission)
router.get('/export/excel', checkPermission('canViewReports'), exportAttendanceToExcel);
router.get('/export/csv', checkPermission('canViewReports'), exportAttendanceToCSV);
router.get('/export/pdf', checkPermission('canViewReports'), exportAttendanceToPDF);

module.exports = router;
