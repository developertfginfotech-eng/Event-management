const ActivityLog = require('../models/ActivityLog');

// Helper function to create activity log
const logActivity = async ({
  user,
  action,
  actionDetails,
  resource,
  resourceId,
  status = 'SUCCESS',
  errorMessage = null,
  req
}) => {
  try {
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      actionDetails,
      resource,
      resourceId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status,
      errorMessage
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent blocking main operation
  }
};

module.exports = logActivity;
