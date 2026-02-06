const express = require('express');
const router = express.Router();

const {
  getPubNubToken,
  sendMessage,
  getEventMessages,
  markMessagesAsRead,
  getUnreadCount,
  getEventUnreadCount,
  deleteMessage,
  getEventParticipants,
  // Direct messaging
  getChatUsers,
  getDMToken,
  sendDirectMessage,
  getDirectMessages,
  getDMUnreadCount,
  // File upload
  uploadFile,
  uploadChatFile
} = require('../controllers/chatController');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// PubNub authentication
router.get('/auth-token', getPubNubToken);

// Unread counts
router.get('/unread-count', getUnreadCount);
router.get('/events/:eventId/unread-count', getEventUnreadCount);

// Event chat messages
router.post('/events/:eventId/messages', sendMessage);
router.get('/events/:eventId/messages', getEventMessages);
router.post('/events/:eventId/messages/mark-read', markMessagesAsRead);

// Event participants
router.get('/events/:eventId/participants', getEventParticipants);

// Message operations
router.delete('/messages/:messageId', deleteMessage);

// Direct Messaging (1:1)
router.get('/users', getChatUsers);
router.get('/dm/auth-token', getDMToken);
router.post('/dm/:recipientId/messages', sendDirectMessage);
router.get('/dm/:otherUserId/messages', getDirectMessages);
router.get('/dm/unread-count', getDMUnreadCount);

// File Upload
router.post('/upload', uploadFile, uploadChatFile);

module.exports = router;
