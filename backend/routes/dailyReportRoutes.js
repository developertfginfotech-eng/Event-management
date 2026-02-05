const express = require('express');
const {
  getDailyReports,
  getDailyReport,
  createDailyReport,
  updateDailyReport,
  submitDailyReport,
  reviewDailyReport,
  deleteDailyReport,
  getDailyReportSummary,
} = require('../controllers/dailyReportController');

const router = express.Router();

const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

// CRUD routes
router.route('/').get(getDailyReports).post(createDailyReport);

router.route('/summary/:userId?').get(getDailyReportSummary);

router
  .route('/:id')
  .get(getDailyReport)
  .put(updateDailyReport)
  .delete(deleteDailyReport);

// Submit report
router.route('/:id/submit').put(submitDailyReport);

// Review report (Manager/Admin only)
router
  .route('/:id/review')
  .put(checkPermission('canViewReports'), reviewDailyReport);

module.exports = router;
