const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_EVENT',
      'UPDATE_EVENT',
      'DELETE_EVENT',
      'ASSIGN_USERS_TO_EVENT',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'BULK_IMPORT_USERS',
      'UPDATE_PROFILE',
      'CHANGE_PASSWORD'
    ]
  },
  actionDetails: {
    type: String
  },
  resource: {
    type: String
  },
  resourceId: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
