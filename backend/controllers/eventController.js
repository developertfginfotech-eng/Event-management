const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res, next) => {
  try {
    const { status, category, startDate, endDate, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // If not admin, show only assigned events
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
      query.$or = [
        { assignedUsers: req.user._id },
        { createdBy: req.user._id },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email role phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin/Super Admin)
exports.createEvent = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin/Super Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Update fields
    Object.assign(event, req.body);

    // Save with validation
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Super Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign users to event
// @route   POST /api/events/:id/assign-users
// @access  Private (Admin/Super Admin)
exports.assignUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more users not found',
      });
    }

    event.assignedUsers = userIds;
    await event.save();

    // Update users' assignedEvents
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { assignedEvents: event._id } }
    );

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get event dashboard stats
// @route   GET /api/events/:id/stats
// @access  Private
exports.getEventStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Aggregate stats from other collections
    const Lead = require('../models/Lead');
    const Expense = require('../models/Expense');

    const totalLeads = await Lead.countDocuments({ event: event._id });
    const convertedLeads = await Lead.countDocuments({
      event: event._id,
      status: 'Converted',
    });

    const expenseStats = await Expense.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' },
          approvedExpense: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] },
          },
          pendingExpense: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        event: event.name,
        totalLeads,
        convertedLeads,
        conversionRate:
          totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0,
        totalExpense: expenseStats[0]?.totalExpense || 0,
        approvedExpense: expenseStats[0]?.approvedExpense || 0,
        pendingExpense: expenseStats[0]?.pendingExpense || 0,
        budget: event.budget,
        budgetUtilization:
          event.budget > 0
            ? (
                ((expenseStats[0]?.approvedExpense || 0) / event.budget) *
                100
              ).toFixed(2)
            : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
