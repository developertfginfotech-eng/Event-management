const express = require('express');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  reviewExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');

const router = express.Router();

const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getExpenses).post(createExpense);

router.route('/summary/:eventId').get(getExpenseSummary);

router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

router
  .route('/:id/review')
  .put(checkPermission('canApproveExpenses'), reviewExpense);

module.exports = router;
