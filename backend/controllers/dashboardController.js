const Event = require('../models/Event');
const Lead = require('../models/Lead');
const Expense = require('../models/Expense');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin/Super Admin/Manager)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Total events
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'Upcoming' });
    const liveEvents = await Event.countDocuments({ status: 'Live' });
    const completedEvents = await Event.countDocuments({ status: 'Completed' });

    // Total leads
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    const conversionRate =
      totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    // Leads by event
    const leadsByEvent = await Lead.aggregate([
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          eventName: '$event.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Expense summary
    const expenseSummary = await Expense.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalExpense =
      expenseSummary.reduce((acc, item) => acc + item.totalAmount, 0) || 0;
    const pendingExpense =
      expenseSummary.find((item) => item._id === 'Pending')?.totalAmount || 0;
    const approvedExpense =
      expenseSummary.find((item) => item._id === 'Approved')?.totalAmount || 0;

    // Attendance summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
    });

    res.status(200).json({
      success: true,
      data: {
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          live: liveEvents,
          completed: completedEvents,
        },
        leads: {
          total: totalLeads,
          new: newLeads,
          converted: convertedLeads,
          conversionRate: parseFloat(conversionRate),
          byEvent: leadsByEvent,
        },
        expenses: {
          total: totalExpense,
          pending: pendingExpense,
          approved: approvedExpense,
        },
        attendance: {
          today: todayAttendance,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res, next) => {
  try {
    // Assigned events
    const assignedEvents = await Event.find({
      assignedUsers: req.user._id,
    }).select('name startDate endDate status location');

    // Assigned leads
    const myLeads = await Lead.countDocuments({ assignedTo: req.user._id });
    const myNewLeads = await Lead.countDocuments({
      assignedTo: req.user._id,
      status: 'New',
    });
    const myConvertedLeads = await Lead.countDocuments({
      assignedTo: req.user._id,
      status: 'Converted',
    });

    // My tasks
    const myTasks = await Task.find({ assignedTo: req.user._id })
      .populate('event', 'name')
      .sort('dueDate')
      .limit(10);

    const pendingTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: 'Pending',
    });

    // My expenses
    const myExpenses = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Today's attendance
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: todayStart },
    });

    res.status(200).json({
      success: true,
      data: {
        events: {
          assigned: assignedEvents,
          count: assignedEvents.length,
        },
        leads: {
          total: myLeads,
          new: myNewLeads,
          converted: myConvertedLeads,
        },
        tasks: {
          pending: pendingTasks,
          recent: myTasks,
        },
        expenses: myExpenses,
        attendance: {
          today: todayAttendance,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
