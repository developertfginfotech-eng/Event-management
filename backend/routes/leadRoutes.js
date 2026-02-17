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
  uploadAndScanBusinessCard,
  updateFollowUp,
  trackCommunication,
  getReminders,
  getEventReport,
  exportToExcel,
  exportToCSV,
} = require('../controllers/leadController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for business card uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/business-cards/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'card-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

router.use(protect);

// Lead CRUD
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLead).put(updateLead).delete(deleteLead);

// Bulk operations
router.route('/bulk-import').post(bulkImport);

// Business card scanning
router.route('/scan-business-card').post(scanBusinessCard);
router.route('/upload-and-scan-business-card').post(upload.single('file'), uploadAndScanBusinessCard);

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
