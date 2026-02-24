const ActivityLog = require('../models/ActivityLog');

// Helper function to create activity log
// Detect source: browsers always include "Mozilla" in their UA; native apps typically don't
const detectSource = (userAgent = '') => {
  return /mozilla/i.test(userAgent) ? 'web' : 'app';
};

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
    const userAgent = req.headers['user-agent'] || '';
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      actionDetails,
      resource,
      resourceId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent,
      source: detectSource(userAgent),
      status,
      errorMessage
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent blocking main operation
  }
};

module.exports = logActivity;
