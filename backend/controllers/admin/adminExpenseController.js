const Expense = require('../../models/Expense');
const User = require('../../models/User');
const Event = require('../../models/Event');
const ExcelJS = require('exceljs');

// @desc    Get all expenses (Admin view - no filtering by user)
// @route   GET /api/admin/expenses
// @access  Private (canApproveExpenses)
exports.getAllExpenses = async (req, res, next) => {
  try {
    const { event, user, status, category, search, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;
    if (category) query.category = category;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Admin sees ALL expenses (no user filtering)
    const expenses = await Expense.find(query)
      .populate('event', 'name startDate endDate')
      .populate('user', 'name email')
      .populate('approvedBy', 'name')
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

// @desc    Get single expense by ID
// @route   GET /api/admin/expenses/:id
// @access  Private (canApproveExpenses)
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('event', 'name startDate endDate location')
      .populate('user', 'name email phone')
      .populate('approvedBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Admin can view any expense
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review expense (Approve/Reject)
// @route   PUT /api/admin/expenses/:id/review
// @access  Private (canApproveExpenses)
exports.reviewExpense = async (req, res, next) => {
  try {
    const { status, adminComments } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Approved/Rejected) is required',
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

    await expense.populate('user', 'name email');
    await expense.populate('event', 'name');
    await expense.populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Expense ${status.toLowerCase()} successfully`,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete expense
// @route   DELETE /api/admin/expenses/:id
// @access  Private (Admin/Super Admin only)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
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

// @desc    Get expenses by event
// @route   GET /api/admin/expenses/reports/event/:eventId
// @access  Private (canApproveExpenses)
exports.getExpensesByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const expenses = await Expense.find({ event: eventId })
      .populate('user', 'name email')
      .populate('approvedBy', 'name')
      .sort('-date');

    const stats = {
      total: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byStatus: {},
      byCategory: {},
      byUser: {},
      pendingAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
    };

    expenses.forEach((expense) => {
      // Status breakdown
      stats.byStatus[expense.status] = (stats.byStatus[expense.status] || 0) + 1;

      // Category breakdown
      stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + 1;

      // User breakdown
      if (expense.user) {
        const userName = expense.user.name;
        stats.byUser[userName] = (stats.byUser[userName] || 0) + expense.amount;
      }

      // Amount by status
      if (expense.status === 'Pending') stats.pendingAmount += expense.amount;
      if (expense.status === 'Approved') stats.approvedAmount += expense.amount;
      if (expense.status === 'Rejected') stats.rejectedAmount += expense.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
        },
        stats,
        expenses,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expenses by user
// @route   GET /api/admin/expenses/reports/user/:userId
// @access  Private (canApproveExpenses)
exports.getExpensesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const expenses = await Expense.find({ user: userId })
      .populate('event', 'name')
      .populate('approvedBy', 'name')
      .sort('-date');

    const stats = {
      total: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byStatus: {},
      byCategory: {},
      approvedAmount: 0,
      pendingAmount: 0,
    };

    expenses.forEach((expense) => {
      stats.byStatus[expense.status] = (stats.byStatus[expense.status] || 0) + 1;
      stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + 1;

      if (expense.status === 'Approved') stats.approvedAmount += expense.amount;
      if (expense.status === 'Pending') stats.pendingAmount += expense.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        stats,
        expenses,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expenses by category
// @route   GET /api/admin/expenses/reports/category/:category
// @access  Private (canApproveExpenses)
exports.getExpensesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const expenses = await Expense.find({ category })
      .populate('event', 'name')
      .populate('user', 'name email')
      .sort('-date');

    const stats = {
      total: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byStatus: {},
      approvedAmount: 0,
    };

    expenses.forEach((expense) => {
      stats.byStatus[expense.status] = (stats.byStatus[expense.status] || 0) + 1;
      if (expense.status === 'Approved') stats.approvedAmount += expense.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        category,
        stats,
        expenses,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export expenses to Excel
// @route   GET /api/admin/expenses/export/excel
// @access  Private (canApproveExpenses)
exports.exportExpensesToExcel = async (req, res, next) => {
  try {
    const { event, user, status, category } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;
    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate('event', 'name')
      .populate('user', 'name')
      .populate('approvedBy', 'name')
      .lean()
      .sort('-date');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Event', key: 'event', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Sub-Category', key: 'subCategory', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
      { header: 'Admin Comments', key: 'adminComments', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };

    // Add data rows
    expenses.forEach((expense) => {
      worksheet.addRow({
        date: new Date(expense.date).toLocaleDateString(),
        user: expense.user?.name || '-',
        event: expense.event?.name || '-',
        category: expense.category,
        subCategory: expense.subCategory || '-',
        description: expense.description,
        amount: expense.amount,
        status: expense.status,
        approvedBy: expense.approvedBy?.name || '-',
        adminComments: expense.adminComments || '-',
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expenses-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
