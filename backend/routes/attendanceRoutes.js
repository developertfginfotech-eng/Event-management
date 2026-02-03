const express = require('express');
const {
  getAttendance,
  getAttendanceRecord,
  checkIn,
  checkOut,
  getAttendanceSummary,
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getAttendance);

router.route('/checkin').post(checkIn);

router.route('/summary/:userId?').get(getAttendanceSummary);

router.route('/:id').get(getAttendanceRecord);

router.route('/:id/checkout').put(checkOut);

module.exports = router;
