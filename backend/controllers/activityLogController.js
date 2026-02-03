const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Admin/Super Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};

    if (action) {
      query.action = action;
    }

    if (userId) {
      query.user = userId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity log statistics
// @route   GET /api/activity-logs/stats
// @access  Admin/Super Admin
exports.getActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get activity counts by action
    const actionStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get most active users
    const userStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          userName: { $first: '$userName' },
          userRole: { $first: '$userRole' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activities
    const recentActivities = await ActivityLog.find(dateFilter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        actionStats,
        userStats,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete old activity logs
// @route   DELETE /api/activity-logs/cleanup
// @access  Super Admin
exports.cleanupOldLogs = async (req, res, next) => {
  try {
    const { daysOld = 90 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} activity logs older than ${daysOld} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
