const express = require('express');
const {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  bulkImport,
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);
router.use(checkPermission('canManageUsers'));

router.route('/').get(getUsers).post(addUser);

router.route('/bulk-import').post(bulkImport);

router.route('/:id').get(getUser).put(updateUser).delete(authorize('Super Admin'), deleteUser);

module.exports = router;
