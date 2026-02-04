const express = require('express');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  addFollowUp,
  bulkImport,
  assignLead,
  attachFile,
  scanBusinessCard,
  updateFollowUp,
  trackCommunication,
  getReminders,
  getEventReport,
  exportToExcel,
  exportToCSV,
} = require('../controllers/leadController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

// Lead CRUD
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLead).put(updateLead).delete(deleteLead);

// Bulk operations
router.route('/bulk-import').post(bulkImport);

// Business card scanning
router.route('/scan-business-card').post(scanBusinessCard);

// Lead management
router.route('/:id/assign').post(assignLead);
router.route('/:id/attachments').post(attachFile);

// Notes and follow-ups
router.route('/:id/notes').post(addNote);
router.route('/:id/followups').post(addFollowUp);
router.route('/:id/followups/:followupId').put(updateFollowUp);

// Communication tracking
router.route('/:id/communications').post(trackCommunication);

// Reminders
router.route('/reminders').get(getReminders);

// Reports and exports
router.route('/reports/source/:sourceId').get(getEventReport);
router.route('/export/excel').get(exportToExcel);
router.route('/export/csv').get(exportToCSV);

module.exports = router;
