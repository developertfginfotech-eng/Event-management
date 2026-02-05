const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { event, user, startDate, endDate, status } = req.query;
    let query = {};

    if (event) query.event = event;
    if (status) query.status = status;

    // If not admin, show only own attendance
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

    const attendance = await Attendance.find(query)
      .populate('user', 'name email role')
      .populate('event', 'name')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceRecord = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('event', 'name location');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const { event, location, selfie } = req.body;

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      event,
      checkIn: {
        time: Date.now(),
        location,
        selfie,
      },
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check out
// @route   PUT /api/attendance/:id/checkout
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const { location } = req.body;

    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (attendance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check out this attendance',
      });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out',
      });
    }

    attendance.checkOut = {
      time: Date.now(),
      location,
    };

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary/:userId
// @access  Private
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    // Convert userId to ObjectId for aggregation
    const userId = req.params.userId
      ? new mongoose.Types.ObjectId(req.params.userId)
      : req.user._id;

    const summary = await Attendance.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalWorkHours: { $sum: '$workHours' },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          halfDay: {
            $sum: { $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary[0] || {
        totalDays: 0,
        totalWorkHours: 0,
        present: 0,
        absent: 0,
        halfDay: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
