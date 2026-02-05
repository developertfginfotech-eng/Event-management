const Expense = require('../../models/Expense');
const User = require('../../models/User');
const Event = require('../../models/Event');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

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

// @desc    Export expenses to CSV
// @route   GET /api/admin/expenses/export/csv
// @access  Private (canApproveExpenses)
exports.exportExpensesToCSV = async (req, res, next) => {
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

    // Create CSV content
    const headers = [
      'Date',
      'User',
      'Event',
      'Category',
      'Sub-Category',
      'Description',
      'Amount (₹)',
      'Status',
      'Approved By',
      'Admin Comments'
    ];

    const rows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.user?.name || '-',
      expense.event?.name || '-',
      expense.category,
      expense.subCategory || '-',
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.amount,
      expense.status,
      expense.approvedBy?.name || '-',
      expense.adminComments ? `"${expense.adminComments.replace(/"/g, '""')}"` : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expenses-${Date.now()}.csv`
    );

    res.send(csvContent);
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

// @desc    Export expenses to PDF
// @route   GET /api/admin/expenses/export/pdf
// @access  Private (canApproveExpenses)
exports.exportExpensesToPDF = async (req, res, next) => {
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

    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const pendingAmount = expenses
      .filter(e => e.status === 'Pending')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const approvedAmount = expenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expenses-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).font('Helvetica-Bold').text('Expenses Report', { align: 'center' });
    doc.moveDown();

    // Add metadata and summary
    doc.fontSize(10).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
      .text(`Total Expenses: ${expenses.length}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('Summary:');
    doc.fontSize(10).font('Helvetica')
      .text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`)
      .text(`Pending: ₹${pendingAmount.toLocaleString('en-IN')}`)
      .text(`Approved: ₹${approvedAmount.toLocaleString('en-IN')}`);
    doc.moveDown(2);

    // Add expenses
    expenses.forEach((expense, index) => {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
      }

      // Expense header
      doc.fontSize(11).font('Helvetica-Bold')
        .fillColor('#4F46E5')
        .text(`${index + 1}. ${expense.description.substring(0, 50)}${expense.description.length > 50 ? '...' : ''}`);

      doc.fontSize(9).font('Helvetica').fillColor('#000000');

      // Expense details in two columns
      const leftColumn = 50;
      const rightColumn = 300;
      let currentY = doc.y;

      // Left column
      doc.y = currentY;
      doc.x = leftColumn;
      doc.text(`User: ${expense.user?.name || '-'}`, leftColumn);
      doc.text(`Event: ${expense.event?.name || '-'}`, leftColumn);
      doc.text(`Date: ${new Date(expense.date).toLocaleDateString()}`, leftColumn);
      doc.text(`Category: ${expense.category}`, leftColumn);

      // Right column
      doc.y = currentY;
      doc.text(`Amount: ₹${expense.amount.toLocaleString('en-IN')}`, rightColumn);
      doc.text(`Status: ${expense.status}`, rightColumn);
      doc.text(`Payment: ${expense.paymentMethod || '-'}`, rightColumn);
      if (expense.approvedBy) {
        doc.text(`Approved By: ${expense.approvedBy.name}`, rightColumn);
      }

      // Add separator line
      doc.moveDown(0.3);
      doc.strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.8);
    });

    // Add footer on last page
    doc.fontSize(8).fillColor('#6B7280')
      .text(
        'Generated by Event Management System',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    // Finalize PDF
    doc.end();
  } catch (err) {
    next(err);
  }
};
