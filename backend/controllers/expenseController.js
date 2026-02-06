const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const { event, user, category, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (category) query.category = category;
    if (status) query.status = status;

    // Only Super Admin and Admin can see all expenses
    // Manager and Field User can only see their own expenses
    if (req.user.role === 'Manager' || req.user.role === 'Field User') {
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

    const expenses = await Expense.find(query)
      .populate('event', 'name startDate endDate')
      .populate('user', 'name email')
      .populate('approvedBy', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('event', 'name startDate endDate')
      .populate('user', 'name email phone')
      .populate('approvedBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Check if user has permission to view this expense
    if (
      !req.user.permissions.canViewReports &&
      expense.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this expense',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // User can only update their own pending expenses
    if (
      expense.user.toString() !== req.user._id.toString() ||
      expense.status !== 'Pending'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense',
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // User can only delete their own pending expenses
    if (
      expense.user.toString() !== req.user._id.toString() ||
      expense.status !== 'Pending'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Reject expense
// @route   PUT /api/expenses/:id/review
// @access  Private (Manager/Admin)
exports.reviewExpense = async (req, res, next) => {
  try {
    const { status, adminComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    expense.status = status;
    expense.adminComments = adminComments;
    expense.approvedBy = req.user.id;
    expense.approvedAt = Date.now();

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary/:eventId
// @access  Private
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(req.params.eventId) } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, '$amount', 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};
