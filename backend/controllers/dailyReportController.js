const DailyReport = require('../models/DailyReport');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

// @desc    Get all daily reports
// @route   GET /api/daily-reports
// @access  Private
exports.getDailyReports = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (status) query.status = status;

    // If not admin/manager, show only own reports
    if (!req.user.permissions.canViewReports) {
      query.user = req.user._id;
    } else if (user) {
      query.user = user;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await DailyReport.find(query)
      .populate('user', 'name email role')
      .populate('event', 'name startDate endDate')
      .populate('reviewedBy', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single daily report
// @route   GET /api/daily-reports/:id
// @access  Private
exports.getDailyReport = async (req, res, next) => {
  try {
    const report = await DailyReport.findById(req.params.id)
      .populate('user', 'name email role phone')
      .populate('event', 'name startDate endDate location')
      .populate('attendance', 'checkIn checkOut workHours')
      .populate('reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    // Check if user has permission to view this report
    if (
      !req.user.permissions.canViewReports &&
      report.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create daily report
// @route   POST /api/daily-reports
// @access  Private
exports.createDailyReport = async (req, res, next) => {
  try {
    // Check if attendance exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No attendance record found for today. Please check in first.',
      });
    }

    // Set user and automatically populate time in from attendance
    req.body.user = req.user.id;
    req.body.attendance = attendance._id;
    req.body.timeIn = attendance.checkIn.time;

    // If attendance has checkout time, use it
    if (attendance.checkOut && attendance.checkOut.time) {
      req.body.timeOut = attendance.checkOut.time;
    }

    // Set current date if not provided
    if (!req.body.date) {
      req.body.date = new Date();
    }

    const report = await DailyReport.create(req.body);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Daily report already exists for today',
      });
    }
    next(err);
  }
};

// @desc    Update daily report
// @route   PUT /api/daily-reports/:id
// @access  Private
exports.updateDailyReport = async (req, res, next) => {
  try {
    let report = await DailyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    // User can only update their own draft reports
    if (
      report.user.toString() !== req.user._id.toString() ||
      report.status !== 'Draft'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report',
      });
    }

    report = await DailyReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email')
      .populate('event', 'name');

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit daily report
// @route   PUT /api/daily-reports/:id/submit
// @access  Private
exports.submitDailyReport = async (req, res, next) => {
  try {
    const report = await DailyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    // User can only submit their own reports
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this report',
      });
    }

    // Check if timeOut is provided
    if (!report.timeOut && !req.body.timeOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide time out before submitting',
      });
    }

    report.status = 'Submitted';
    report.submittedAt = Date.now();
    if (req.body.timeOut) {
      report.timeOut = req.body.timeOut;
    }

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review daily report (Approve/Reject)
// @route   PUT /api/daily-reports/:id/review
// @access  Private (Manager/Admin)
exports.reviewDailyReport = async (req, res, next) => {
  try {
    const { status, reviewComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const report = await DailyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    if (report.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted reports can be reviewed',
      });
    }

    report.status = status;
    report.reviewComments = reviewComments;
    report.reviewedBy = req.user.id;
    report.reviewedAt = Date.now();

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete daily report
// @route   DELETE /api/daily-reports/:id
// @access  Private
exports.deleteDailyReport = async (req, res, next) => {
  try {
    const report = await DailyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    // User can only delete their own draft reports
    if (
      report.user.toString() !== req.user._id.toString() ||
      report.status !== 'Draft'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report',
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Daily report deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get daily report summary/statistics
// @route   GET /api/daily-reports/summary/:userId?
// @access  Private
exports.getDailyReportSummary = async (req, res, next) => {
  try {
    const userId = req.params.userId
      ? new mongoose.Types.ObjectId(req.params.userId)
      : req.user._id;

    const summary = await DailyReport.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalBooths: { $sum: '$coverageSummary.boothsCovered' },
          totalInterviews: { $sum: '$coverageSummary.interviewsConducted' },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary[0] || {
        totalReports: 0,
        totalBooths: 0,
        totalInterviews: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
