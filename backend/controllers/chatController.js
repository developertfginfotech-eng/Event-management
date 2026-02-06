const Message = require('../models/Message');
const Event = require('../models/Event');
const User = require('../models/User');
const {
  publishMessage,
  getEventChannelName,
  generatePubNubToken
} = require('../config/pubnub');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|mp3|wav|m4a|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and audio files are allowed!'));
    }
  }
}).single('file');

// Export upload middleware
exports.uploadFile = upload;

// @desc    Get PubNub auth token for user
// @route   GET /api/chat/auth-token
// @access  Private
exports.getPubNubToken = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all events assigned to user
    const user = await User.findById(userId).populate('assignedEvents');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Get event IDs user has access to
    let eventIds = user.assignedEvents.map(e => e._id.toString());

    // Admins and Super Admins get access to all events
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      const allEvents = await Event.find({ isActive: true });
      eventIds = allEvents.map(e => e._id.toString());
    }

    // Generate PubNub token with 24 hour TTL
    const tokenResponse = await generatePubNubToken(userId, eventIds, 1440);

    res.status(200).json({
      success: true,
      data: {
        token: tokenResponse.token,
        ttl: tokenResponse.ttl,
        channels: eventIds.map(id => `event-${id}`),
        uuid: `user-${userId}`
      }
    });
  } catch (err) {
    console.error('PubNub token generation error:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating PubNub token'
    });
  }
};

// @desc    Send a message to event chat
// @route   POST /api/chat/events/:eventId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { content, messageType, attachments, metadata } = req.body;
    const senderId = req.user._id;

    // Verify event exists and user has access
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is assigned to event or is admin
    const isAssigned = event.assignedUsers.some(
      userId => userId.toString() === senderId.toString()
    );
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Super Admin';

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this event chat'
      });
    }

    // Create message in MongoDB
    const message = await Message.create({
      event: eventId,
      sender: senderId,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      metadata: metadata || {}
    });

    // Populate sender details
    await message.populate('sender', 'name email profilePhoto role');

    // Prepare PubNub payload
    const pubnubPayload = {
      messageId: message._id.toString(),
      eventId: eventId,
      sender: {
        id: message.sender._id.toString(),
        name: message.sender.name,
        profilePhoto: message.sender.profilePhoto,
        role: message.sender.role
      },
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      timestamp: message.createdAt.toISOString(),
      metadata: message.metadata
    };

    // Publish to PubNub
    const channelName = getEventChannelName(eventId);
    const publishResponse = await publishMessage(channelName, pubnubPayload);

    // Store PubNub timetoken for reference
    message.pubnubTimetoken = publishResponse.timetoken;
    await message.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    console.error('Send message error:', err);
    next(err);
  }
};

// @desc    Get chat history for an event
// @route   GET /api/chat/events/:eventId/messages
// @access  Private
exports.getEventMessages = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { limit = 50, before, after } = req.query;
    const userId = req.user._id;

    // Verify event exists and user has access
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access
    const isAssigned = event.assignedUsers.some(
      id => id.toString() === userId.toString()
    );
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Super Admin';

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this event chat'
      });
    }

    // Build query
    let query = { event: eventId, isDeleted: false };

    // Pagination
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email profilePhoto role')
      .sort(after ? 'createdAt' : '-createdAt')
      .limit(parseInt(limit));

    // If querying after a date, reverse to show oldest first
    if (after) {
      messages.reverse();
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('Get messages error:', err);
    next(err);
  }
};

// @desc    Mark messages as read
// @route   POST /api/chat/events/:eventId/messages/mark-read
// @access  Private
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user._id;

    // Verify access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update messages
    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        event: eventId,
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    // Publish read receipts via PubNub
    if (messageIds && messageIds.length > 0) {
      const channelName = getEventChannelName(eventId);

      // Send read receipt for each message
      for (const messageId of messageIds) {
        await publishMessage(channelName, {
          type: 'message_read',
          messageId: messageId,
          readBy: userId.toString(),
          timestamp: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    console.error('Mark read error:', err);
    next(err);
  }
};

// @desc    Get unread message count for user
// @route   GET /api/chat/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's assigned events
    const user = await User.findById(userId);
    let eventIds = user.assignedEvents;

    // Admins see all events
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      const allEvents = await Event.find({ isActive: true });
      eventIds = allEvents.map(e => e._id);
    }

    // Count unread messages per event
    const unreadCounts = await Promise.all(
      eventIds.map(async eventId => {
        const count = await Message.countDocuments({
          event: eventId,
          sender: { $ne: userId },
          isDeleted: false,
          'readBy.user': { $ne: userId }
        });

        return {
          eventId: eventId.toString(),
          unreadCount: count
        };
      })
    );

    // Calculate total
    const totalUnread = unreadCounts.reduce(
      (sum, item) => sum + item.unreadCount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalUnread,
        byEvent: unreadCounts.filter(item => item.unreadCount > 0)
      }
    });
  } catch (err) {
    console.error('Unread count error:', err);
    next(err);
  }
};

// @desc    Get unread count for specific event
// @route   GET /api/chat/events/:eventId/unread-count
// @access  Private
exports.getEventUnreadCount = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const count = await Message.countDocuments({
      event: eventId,
      sender: { $ne: userId },
      isDeleted: false,
      'readBy.user': { $ne: userId }
    });

    res.status(200).json({
      success: true,
      data: {
        eventId,
        unreadCount: count
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or admin can delete
    const isOwner = message.sender && message.sender.toString() === userId.toString();
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Super Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = Date.now();
    await message.save();

    // Publish deletion event to PubNub
    const channelName = getEventChannelName(message.event);
    await publishMessage(channelName, {
      type: 'message_deleted',
      messageId: messageId,
      deletedBy: userId.toString(),
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chat participants for an event
// @route   GET /api/chat/events/:eventId/participants
// @access  Private
exports.getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate(
      'assignedUsers',
      'name email profilePhoto role isActive lastLogin'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Filter active users only
    const participants = event.assignedUsers.filter(user => user.isActive);

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// DIRECT MESSAGING (1:1) ENDPOINTS
// ============================================

// Helper function to generate DM channel name (consistent ordering)
const getDMChannelName = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `dm-${ids[0]}-${ids[1]}`;
};

// @desc    Get list of users for direct messaging
// @route   GET /api/chat/users
// @access  Private
exports.getChatUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Get all active users except current user
    const users = await User.find({
      _id: { $ne: currentUserId },
      isActive: true
    })
      .select('name email profilePhoto role lastLogin')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Get chat users error:', err);
    next(err);
  }
};

// @desc    Get PubNub token for direct messages
// @route   GET /api/chat/dm/auth-token
// @access  Private
exports.getDMToken = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all active users to generate DM channels
    const allUsers = await User.find({ isActive: true });
    const dmChannels = [];

    // Generate DM channel names for all possible conversations
    allUsers.forEach(user => {
      if (user._id.toString() !== userId.toString()) {
        dmChannels.push(getDMChannelName(userId, user._id));
      }
    });

    // Generate PubNub token for all DM channels
    const tokenResponse = await generatePubNubToken(userId, dmChannels, 1440);

    res.status(200).json({
      success: true,
      data: {
        token: tokenResponse.token,
        ttl: tokenResponse.ttl,
        channels: dmChannels,
        uuid: `user-${userId}`
      }
    });
  } catch (err) {
    console.error('DM token generation error:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating DM token'
    });
  }
};

// @desc    Send direct message to a user
// @route   POST /api/chat/dm/:recipientId/messages
// @access  Private
exports.sendDirectMessage = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const { content, messageType, attachments, metadata } = req.body;
    const senderId = req.user._id;

    // Verify recipient exists and is active
    const recipient = await User.findById(recipientId);

    if (!recipient || !recipient.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found or inactive'
      });
    }

    // Create message in MongoDB
    const message = await Message.create({
      chatType: 'direct',
      sender: senderId,
      recipient: recipientId,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      metadata: metadata || {}
    });

    // Populate sender details
    await message.populate('sender', 'name email profilePhoto role');
    await message.populate('recipient', 'name email profilePhoto role');

    // Prepare PubNub payload
    const pubnubPayload = {
      messageId: message._id.toString(),
      chatType: 'direct',
      sender: {
        id: message.sender._id.toString(),
        name: message.sender.name,
        profilePhoto: message.sender.profilePhoto,
        role: message.sender.role
      },
      recipient: {
        id: message.recipient._id.toString(),
        name: message.recipient.name
      },
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      timestamp: message.createdAt.toISOString(),
      metadata: message.metadata
    };

    // Publish to PubNub DM channel
    const channelName = getDMChannelName(senderId, recipientId);
    const publishResponse = await publishMessage(channelName, pubnubPayload);

    // Store PubNub timetoken
    message.pubnubTimetoken = publishResponse.timetoken;
    await message.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    console.error('Send DM error:', err);
    next(err);
  }
};

// @desc    Get direct message history with a user
// @route   GET /api/chat/dm/:otherUserId/messages
// @access  Private
exports.getDirectMessages = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const { limit = 50, before, after } = req.query;
    const currentUserId = req.user._id;

    // Build query for messages between two users
    let query = {
      chatType: 'direct',
      isDeleted: false,
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    };

    // Pagination
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email profilePhoto role')
      .populate('recipient', 'name email profilePhoto role')
      .sort(after ? 'createdAt' : '-createdAt')
      .limit(parseInt(limit));

    if (after) {
      messages.reverse();
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('Get DMs error:', err);
    next(err);
  }
};

// @desc    Get unread DM count
// @route   GET /api/chat/dm/unread-count
// @access  Private
exports.getDMUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Count unread DMs (messages sent to user that haven't been read)
    const count = await Message.countDocuments({
      chatType: 'direct',
      recipient: userId,
      isDeleted: false,
      'readBy.user': { $ne: userId }
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (err) {
    console.error('DM unread count error:', err);
    next(err);
  }
};

// @desc    Get unread DM count per user
// @route   GET /api/chat/dm/unread-per-user
// @access  Private
exports.getDMUnreadPerUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get unread DMs grouped by sender
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          chatType: 'direct',
          recipient: userId,
          isDeleted: false,
          'readBy.user': { $ne: userId }
        }
      },
      {
        $group: {
          _id: '$sender',
          unreadCount: { $sum: 1 },
          lastMessageTime: { $max: '$createdAt' }
        }
      }
    ]);

    // Convert to object format for easy lookup
    const unreadCounts = {};
    unreadMessages.forEach(item => {
      unreadCounts[item._id.toString()] = {
        count: item.unreadCount,
        lastMessageTime: item.lastMessageTime
      };
    });

    res.status(200).json({
      success: true,
      data: unreadCounts
    });
  } catch (err) {
    console.error('DM unread per user error:', err);
    next(err);
  }
};

// @desc    Mark DM messages as read
// @route   POST /api/chat/dm/:otherUserId/mark-read
// @access  Private
exports.markDMAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    // Get all unread messages before updating
    const unreadMessages = await Message.find({
      chatType: 'direct',
      sender: otherUserId,
      recipient: userId,
      isDeleted: false,
      'readBy.user': { $ne: userId }
    }).select('_id');

    // Mark all unread messages from otherUserId to userId as read
    const result = await Message.updateMany(
      {
        chatType: 'direct',
        sender: otherUserId,
        recipient: userId,
        isDeleted: false,
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    // Publish read receipts via PubNub
    if (unreadMessages.length > 0) {
      const channelName = getDMChannelName(userId.toString(), otherUserId.toString());

      // Send read receipt for each message
      for (const msg of unreadMessages) {
        await publishMessage(channelName, {
          type: 'message_read',
          messageId: msg._id.toString(),
          readBy: userId.toString(),
          timestamp: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    console.error('Mark DM as read error:', err);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};
// @desc    Upload file for chat
// @route   POST /api/chat/upload
// @access  Private
exports.uploadChatFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const fileData = {
      url: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };

    res.status(200).json({
      success: true,
      data: fileData
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
};
