const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  assignUsers,
  getEventStats,
} = require('../controllers/eventController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getEvents)
  .post(checkPermission('canManageEvents'), createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(checkPermission('canManageEvents'), updateEvent)
  .delete(authorize('Super Admin', 'Admin'), deleteEvent);

router
  .route('/:id/assign-users')
  .post(checkPermission('canManageEvents'), assignUsers);

router.route('/:id/stats').get(getEventStats);

module.exports = router;
