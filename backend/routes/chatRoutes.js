const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

// Chat routes will be implemented with Socket.io
// These are placeholder routes for REST API if needed

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chat feature will be implemented with Socket.io',
  });
});

module.exports = router;
