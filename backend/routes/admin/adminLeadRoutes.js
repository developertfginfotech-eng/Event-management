const express = require('express');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  addAttachment,
  assignLead,
  bulkImportLeads,
  deleteLead,
  getEventReport,
  exportToExcel,
  exportToCSV,
  exportToPDF,
} = require('../../controllers/admin/adminLeadController');

const router = express.Router();

const { protect, checkPermission, authorize } = require('../../middleware/auth');

// All admin routes require authentication and canViewAllLeads permission
router.use(protect);
router.use(checkPermission('canViewAllLeads'));

// View all leads (Admin/Manager only)
router.get('/', getAllLeads);

// Create new lead
router.post('/', createLead);

// View single lead
router.get('/:id', getLeadById);

// Update lead
router.put('/:id', updateLead);

// Add attachments to lead
router.post('/:id/attachments', addAttachment);

// Assign lead to user
router.post('/:id/assign', assignLead);

// Bulk import leads from CSV
router.post('/bulk-import', bulkImportLeads);

// Delete lead (Admin/Super Admin only)
router.delete('/:id', authorize('Admin', 'Super Admin'), deleteLead);

// Event-wise lead report
router.get('/reports/source/:sourceId', getEventReport);

// Export leads to Excel
router.get('/export/excel', exportToExcel);

// Export leads to CSV
router.get('/export/csv', exportToCSV);

// Export leads to PDF
router.get('/export/pdf', exportToPDF);

module.exports = router;
