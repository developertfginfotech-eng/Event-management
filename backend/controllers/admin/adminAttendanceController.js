const Attendance = require('../../models/Attendance');
const ExcelJS = require('exceljs');

// @desc    Export attendance to Excel
// @route   GET /api/admin/attendance/export/excel
// @access  Private (canViewReports)
exports.exportAttendanceToExcel = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('event', 'name')
      .populate('user', 'name email')
      .lean()
      .sort('-date');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Event', key: 'event', width: 25 },
      { header: 'Check-In Time', key: 'checkInTime', width: 20 },
      { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
      { header: 'Work Hours', key: 'workHours', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Location', key: 'location', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };

    // Add data rows
    attendance.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        user: record.user?.name || '-',
        email: record.user?.email || '-',
        event: record.event?.name || '-',
        checkInTime: record.checkIn?.time
          ? new Date(record.checkIn.time).toLocaleTimeString()
          : '-',
        checkOutTime: record.checkOut?.time
          ? new Date(record.checkOut.time).toLocaleTimeString()
          : '-',
        workHours: record.workHours || 0,
        status: record.status,
        location: record.checkIn?.location?.address || '-',
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/admin/attendance/export/csv
// @access  Private (canViewReports)
exports.exportAttendanceToCSV = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('event', 'name')
      .populate('user', 'name email')
      .lean()
      .sort('-date');

    // Create CSV content
    const headers = [
      'Date',
      'User',
      'Email',
      'Event',
      'Check-In Time',
      'Check-Out Time',
      'Work Hours',
      'Status',
      'Location'
    ];

    const rows = attendance.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.user?.name || '-',
      record.user?.email || '-',
      record.event?.name || '-',
      record.checkIn?.time
        ? new Date(record.checkIn.time).toLocaleTimeString()
        : '-',
      record.checkOut?.time
        ? new Date(record.checkOut.time).toLocaleTimeString()
        : '-',
      record.workHours || 0,
      record.status,
      record.checkIn?.location?.address
        ? `"${record.checkIn.location.address.replace(/"/g, '""')}"`
        : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.csv`
    );

    res.send(csvContent);
  } catch (err) {
    next(err);
  }
};
