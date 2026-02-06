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
  exportExpensesToCSV,
  exportExpensesToPDF,
} = require('../../controllers/admin/adminExpenseController');

const router = express.Router();

const { protect, checkPermission, authorize } = require('../../middleware/auth');

// All admin expense routes require authentication
router.use(protect);

// View all expenses (requires canViewReports - Managers can view)
router.get('/', checkPermission('canViewReports'), getAllExpenses);

// Reports (must be before /:id to avoid route conflicts)
router.get('/reports/event/:eventId', checkPermission('canViewReports'), getExpensesByEvent);
router.get('/reports/user/:userId', checkPermission('canViewReports'), getExpensesByUser);
router.get('/reports/category/:category', checkPermission('canViewReports'), getExpensesByCategory);

// Export (must be before /:id to avoid route conflicts)
router.get('/export/excel', checkPermission('canViewReports'), exportExpensesToExcel);
router.get('/export/csv', checkPermission('canViewReports'), exportExpensesToCSV);
router.get('/export/pdf', checkPermission('canViewReports'), exportExpensesToPDF);

// View single expense
router.get('/:id', checkPermission('canViewReports'), getExpenseById);

// Review expense (Approve/Reject) - requires canApproveExpenses (Admins only)
router.put('/:id/review', checkPermission('canApproveExpenses'), reviewExpense);

// Delete expense (Admin/Super Admin only)
router.delete('/:id', authorize('Admin', 'Super Admin'), deleteExpense);

module.exports = router;
