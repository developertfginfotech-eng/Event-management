const express = require('express');
const {
  getAllExpenses,
  getExpenseById,
  reviewExpense,
  deleteExpense,
  getExpensesByEvent,
  getExpensesByUser,
  getExpensesByCategory,
  exportExpensesToExcel,
} = require('../../controllers/admin/adminExpenseController');

const router = express.Router();

const { protect, checkPermission, authorize } = require('../../middleware/auth');

// All admin expense routes require authentication and canApproveExpenses permission
router.use(protect);
router.use(checkPermission('canApproveExpenses'));

// View all expenses (Admin/Manager only)
router.get('/', getAllExpenses);

// Reports (must be before /:id to avoid route conflicts)
router.get('/reports/event/:eventId', getExpensesByEvent);
router.get('/reports/user/:userId', getExpensesByUser);
router.get('/reports/category/:category', getExpensesByCategory);

// Export (must be before /:id to avoid route conflicts)
router.get('/export/excel', exportExpensesToExcel);

// View single expense
router.get('/:id', getExpenseById);

// Review expense (Approve/Reject)
router.put('/:id/review', reviewExpense);

// Delete expense (Admin/Super Admin only)
router.delete('/:id', authorize('Admin', 'Super Admin'), deleteExpense);

module.exports = router;
