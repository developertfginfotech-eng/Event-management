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
} = require('../controllers/leadController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getLeads).post(createLead);

router.route('/bulk-import').post(bulkImport);

router.route('/:id').get(getLead).put(updateLead).delete(deleteLead);

router.route('/:id/notes').post(addNote);

router.route('/:id/followups').post(addFollowUp);

router.route('/:id/assign').post(assignLead);

module.exports = router;
